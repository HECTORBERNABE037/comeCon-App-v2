import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // 1. INICIALIZACIÓN
  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('comecon.db');
      
      // Habilitar claves foráneas
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      await this.createTables();
      console.log('✅ [SQLite] Base de datos inicializada.');
    } catch (error) {
      console.error('❌ [SQLite] Error init:', error);
    }
  }

  // 2. CREACIÓN DE TABLAS
  private async createTables(): Promise<void> {
    if (!this.db) return;
    
    // a) Usuarios
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, 
        name TEXT,
        nickname TEXT,
        role TEXT NOT NULL,
        phone TEXT,
        gender TEXT,
        country TEXT,
        address TEXT,
        image TEXT,
        allowNotifications INTEGER DEFAULT 1, 
        allowCamera INTEGER DEFAULT 1
      );
    `);

    // b) Productos (Catálogo Offline)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        promotionalPrice REAL,
        visible INTEGER DEFAULT 1
      );
    `);

    // c) Carrito (Local)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      );
    `);
    //d) promociones local
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY,
        productId INTEGER,
        description TEXT,
        image TEXT,
        discountPrice REAL,
        FOREIGN KEY(productId) REFERENCES products(id)
      );
    `);
  }

  // ==========================================
  // MÉTODOS DE USUARIO (AUTH)
  // ==========================================

  async syncUser(apiUser: any, passwordInput: string): Promise<void> {
    if (!this.db) return;
    const db = this.db; // <--- Referencia local segura
    
    try {
      const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [apiUser.email]);

      const role = apiUser.role || 'cliente';
      const name = apiUser.name || '';
      const nickname = apiUser.nickname || '';
      const phone = apiUser.phone || '';
      const image = apiUser.image || ''; 
      const userId = apiUser.id; // ID que viene de Django

      if (existing) {
        await db.runAsync(
          `UPDATE users SET id=?, name=?, nickname=?, role=?, password=?, phone=?, image=? WHERE email=?`,
          [userId, name, nickname, role, passwordInput, phone, image, apiUser.email]
        );
      } else {
        await db.runAsync(
          `INSERT INTO users (id, email, password, name, nickname, role, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, apiUser.email, passwordInput, name, nickname, role, phone, image]
        );
      }
      console.log(`💾 [SQLite] Usuario ${apiUser.email} sincronizado.`);
    } catch (error) {
      console.error("❌ [SQLite] Error syncUser:", error);
    }
  }

  async getLocalUser(email: string): Promise<any | null> {
    if (!this.db) return null;
    try {
      return await this.db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      return null;
    }
  }

  async checkLocalCredentials(email: string, password: string): Promise<any | null> {
    if (!this.db) return null;
    try {
      return await this.db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?', 
        [email, password]
      );
    } catch (error) {
      return null;
    }
  }

  // Métodos auxiliares para Profile/Settings (si los usas)
  async updateUserImage(email: string, imageUri: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync('UPDATE users SET image = ? WHERE email = ?', [imageUri, email]);
      return true;
    } catch (e) { return false; }
  }

  async updateUserSettings(email: string, settings: any): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync(
        'UPDATE users SET allowNotifications = ?, allowCamera = ? WHERE email = ?',
        [settings.allowNotifications ? 1 : 0, settings.allowCamera ? 1 : 0, email]
      );
      return true;
    } catch (e) { return false; }
  }

  async checkUserExists(email: string): Promise<boolean> {
    if (!this.db) return false;
    const res = await this.db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
    return !!res;
  }

  async updatePassword(email: string, newPass: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync('UPDATE users SET password = ? WHERE email = ?', [newPass, email]);
      return true;
    } catch (e) { return false; }
  }

  // ==========================================
  // MÉTODOS DE PRODUCTOS (SYNC)
  // ==========================================

  async syncProducts(apiProducts: any[]): Promise<void> {
    if (!this.db) return;
    const db = this.db;
    
    try {
      await db.withTransactionAsync(async () => {
        // Limpiamos tablas para evitar datos viejos
        await db.runAsync('DELETE FROM promotions');
        await db.runAsync('DELETE FROM products');

        for (const p of apiProducts) {
          const title = p.name || p.title || 'Sin Título'; 
          const image = p.image || ''; 
          
          // DETECTAR PROMOCIÓN
          let promoPrice = null;
          let promoId = null;
          
          // Si el backend manda "promotion": { ... }
          if (p.promotion) {
             promoPrice = parseFloat(p.promotion.discount_price);
             promoId = p.promotion.id;

             // Guardamos en la tabla de Banners de Promociones
             await db.runAsync(
               `INSERT INTO promotions (id, productId, description, image, discountPrice)
                VALUES (?, ?, ?, ?, ?)`,
               [
                 promoId,
                 p.id,
                 p.promotion.description || '¡Oferta especial!',
                 p.promotion.image || image, // Si la promo no tiene imagen, usa la del producto
                 promoPrice
               ]
             );
          }

          // Guardamos el Producto (con su precio promocional ya calculado en la columna)
          await db.runAsync(
            `INSERT INTO products (id, title, description, price, image, category, promotionalPrice, visible) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id, 
              title, 
              p.description || '', 
              parseFloat(p.price), 
              image, 
              p.category || 'General', 
              promoPrice, // Aquí guardamos el precio oferta (o null)
              p.is_active !== false ? 1 : 0
            ]
          );
        }
      });
      console.log(`✅ [SQLite] Sincronización completa: Productos y Promociones.`);
    } catch (error) {
      console.error("❌ Error syncProducts:", error);
    }
  }

  //obtener productos
  async getProducts(): Promise<any[]> {
    if (!this.db) return [];
    try {
      // Devolver productos visibles
      return await this.db.getAllAsync('SELECT * FROM products WHERE visible = 1');
    } catch (error) {
      console.error("Error getProducts:", error);
      return [];
    }
  }

  //obtener promociones
  async getPromotions(): Promise<any[]> {
    if (!this.db) return [];
    try {
      return await this.db.getAllAsync('SELECT * FROM promotions');
    } catch (e) { return []; }
  }

  async getPromotionsWithProduct(): Promise<any[]> {
    if (!this.db) return [];
    try {
      // Unimos la tabla promociones con productos para tener el objeto completo para navegar
      const query = `
        SELECT 
          pr.id as promoId, pr.description as promoDesc, pr.image as promoImage, pr.discountPrice,
          p.id, p.title, p.description, p.price, p.image, p.category, p.promotionalPrice, p.visible
        FROM promotions pr
        JOIN products p ON pr.productId = p.id
      `;
      const results = await this.db.getAllAsync(query);
      
      // Formateamos para que sea fácil de usar en la UI
      return results.map((row: any) => ({
        id: row.promoId,
        description: row.promoDesc,
        image: row.promoImage,
        discountPrice: row.discountPrice,
        // Reconstruimos el objeto 'product' completo para la navegación
        product: {
          id: row.id,
          title: row.title,
          description: row.description,
          price: row.price,
          image: row.image, // Ojo: Aquí usará la imagen del producto si la promo no tuviera, pero la query prioriza
          category: row.category,
          promotionalPrice: row.promotionalPrice
        }
      }));
    } catch (e) {
      console.error("Error getPromotionsWithProduct", e);
      return [];
    }
  }

  // ==========================================
  // MÉTODOS DEL CARRITO (CART)
  // ==========================================

  async addToCart(userId: number, productId: number, quantity: number): Promise<void> {
    if (!this.db) return;
    const db = this.db;

    try {
      // 1. Verificar si ya existe el producto en el carrito del usuario
      const existingItem = await db.getFirstAsync<{ id: number, quantity: number }>(
        'SELECT id, quantity FROM cart WHERE userId = ? AND productId = ?',
        [userId, productId]
      );

      if (existingItem) {
        // 2a. Actualizar cantidad
        const newQuantity = existingItem.quantity + quantity;
        await db.runAsync(
          'UPDATE cart SET quantity = ? WHERE id = ?',
          [newQuantity, existingItem.id]
        );
        console.log(`🛒 Cantidad actualizada para producto ${productId}`);
      } else {
        // 2b. Insertar nuevo
        await db.runAsync(
          'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
        console.log(`🛒 Producto ${productId} agregado al carrito.`);
      }
    } catch (error) {
      console.error("❌ Error addToCart:", error);
      throw error; // Re-lanzar para que la pantalla pueda mostrar alerta
    }
  }
  // Obtener items con detalle de producto
  async getCartItems(userId: number): Promise<any[]> {
    if (!this.db) return [];
    try {
      const query = `
        SELECT c.id as cartItemId, c.quantity, p.* FROM cart c
        JOIN products p ON c.productId = p.id
        WHERE c.userId = ?
      `;
      const items = await this.db.getAllAsync(query, [userId]);
      return items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        promotionalPrice: item.promotionalPrice ? Number(item.promotionalPrice) : null
      }));
    } catch (error) {
      console.error("Error getCartItems:", error);
      return [];
    }
  }

  // Contar total de productos (para el Badge)
  async getCartCount(userId: number): Promise<number> {
    if (!this.db) return 0;
    try {
      const result = await this.db.getFirstAsync<{ total: number }>(
        'SELECT SUM(quantity) as total FROM cart WHERE userId = ?', 
        [userId]
      );
      return result?.total || 0;
    } catch (error) { return 0; }
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM cart WHERE userId = ? AND productId = ?', [userId, productId]);
  }

  async clearCart(userId: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM cart WHERE userId = ?', [userId]);
  }
}

export default new DatabaseService();