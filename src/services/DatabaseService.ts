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
        subtitle TEXT,
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
        startDate TEXT,
        endDate TEXT,
        visible INTEGER DEFAULT 1, 
        FOREIGN KEY(productId) REFERENCES products(id)
      );
    `);
  }

  // ==========================================
  // MÉTODOS DE USUARIO (AUTH)
  // ==========================================

  // async syncUser(apiUser: any, passwordInput: string): Promise<void> {
  //   if (!this.db) return;
  //   const db = this.db;
    
  //   try {
  //     const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [apiUser.email]);

  //     const role = apiUser.role || 'cliente';
  //     const name = apiUser.name || '';
  //     const nickname = apiUser.nickname || '';
  //     const phone = apiUser.phone || '';
  //     const image = apiUser.image || ''; 
      
  //     // ✅ AGREGAMOS ESTOS CAMPOS QUE FALTABAN:
  //     const address = apiUser.address || ''; 
  //     const gender = apiUser.gender || '';
  //     const country = apiUser.country || '';

  //     const userId = apiUser.id; 

  //     if (existing) {
  //       // Actualizamos INCLUYENDO address, gender y country
  //       await db.runAsync(
  //         `UPDATE users SET id=?, name=?, nickname=?, role=?, password=?, phone=?, image=?, address=?, gender=?, country=? WHERE email=?`,
  //         [userId, name, nickname, role, passwordInput, phone, image, address, gender, country, apiUser.email]
  //       );
  //     } else {
  //       // Insertamos INCLUYENDO address, gender y country
  //       await db.runAsync(
  //         `INSERT INTO users (id, email, password, name, nickname, role, phone, image, address, gender, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //         [userId, apiUser.email, passwordInput, name, nickname, role, phone, image, address, gender, country]
  //       );
  //     }
  //     console.log(`💾 [SQLite] Usuario ${apiUser.email} sincronizado con dirección.`);
  //   } catch (error) {
  //     console.error("❌ [SQLite] Error syncUser:", error);
  //   }
  // }

  async getLocalUser(email: string): Promise<any | null> {
    if (!this.db) return null;
    return await this.db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
  }
  
  async syncUser(apiUser: any, passwordInput: string): Promise<void> {
    if (!this.db) return;
    const db = this.db;
    try {
      const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [apiUser.email]);
      const params = [
          apiUser.id, apiUser.name||'', apiUser.nickname||'', apiUser.role||'cliente', passwordInput,
          apiUser.phone||'', apiUser.image||'', apiUser.address||'', apiUser.gender||'', apiUser.country||'',
          apiUser.allow_notifications?1:0, apiUser.allow_camera?1:0, apiUser.email
      ];
      if (existing) {
        await db.runAsync(`UPDATE users SET id=?, name=?, nickname=?, role=?, password=?, phone=?, image=?, address=?, gender=?, country=?, allowNotifications=?, allowCamera=? WHERE email=?`, params);
      } else {
        const insertParams = [params[12], params[4], params[1], params[2], params[3], params[5], params[6], params[7], params[8], params[9], params[10], params[11], params[0]]; 
        await db.runAsync(`INSERT INTO users (email, password, name, nickname, role, phone, image, address, gender, country, allowNotifications, allowCamera, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, insertParams);
      }
    } catch (e) { console.error("SyncUser Error", e); }
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
        await db.runAsync('DELETE FROM promotions');
        
        for (const p of apiProducts) {
          const title = p.name || p.title || 'Sin Título'; 
          const subtitle = p.subtitle || ''; 
          const image = p.image || ''; 
          
          let promoPrice = null;
          let promoId = null;
          
          // Datos de la promo (ahora vienen SIEMPRE, activos o no)
          if (p.promotion) {
             // Solo mostramos precio tachado en el Home si la promo es VISIBLE
             if (p.promotion.visible) {
                promoPrice = parseFloat(p.promotion.discount_price);
             }
             promoId = p.promotion.id;
          }

          // A) Upsert Producto
          await db.runAsync(
            `INSERT OR REPLACE INTO products (id, title, subtitle, description, price, image, category, promotionalPrice, visible) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id, title, subtitle, p.description || '', parseFloat(p.price), image, 
              p.category || 'General', promoPrice, p.visible !== false ? 1 : 0
            ]
          );

          // B) Insertar Promoción (Guardamos su estado real)
          if (p.promotion) {
             await db.runAsync(
               `INSERT OR REPLACE INTO promotions (id, productId, description, image, discountPrice, startDate, endDate, visible)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
               [
                 promoId, 
                 p.id, 
                 p.promotion.description || 'Oferta', 
                 p.promotion.image || image, 
                 parseFloat(p.promotion.discount_price),
                 p.promotion.start_date || '',
                 p.promotion.end_date || '',
                 p.promotion.visible ? 1 : 0 // ✅ Guardamos si está activa o pausada
               ]
             );
          }
        }
      });
      console.log(`✅ [SQLite] Sync completo.`);
    } catch (error) {
      console.error("❌ Error syncProducts:", error);
    }
  }

  // Cliente: Solo visibles
  async getProducts(): Promise<any[]> {
    if (!this.db) return [];
    try {
      return await this.db.getAllAsync('SELECT * FROM products WHERE visible = 1');
    } catch (error) { return []; }
  }
  

  //obtener promociones
  async getPromotionsWithProduct(): Promise<any[]> {
    if (!this.db) return [];
    try {
      // ✅ FILTRO CLAVE: Solo mostrar promos visibles al cliente
      const query = `
        SELECT pr.id as promoId, pr.description as promoDesc, pr.image as promoImage, pr.discountPrice,
          p.id, p.title, p.description, p.price, p.image, p.category, p.promotionalPrice, p.visible
        FROM promotions pr 
        JOIN products p ON pr.productId = p.id
        WHERE pr.visible = 1 
      `;
      const results = await this.db.getAllAsync(query);
      // ... mapeo igual ...
      return results.map((row: any) => ({
        id: row.promoId,
        description: row.promoDesc,
        image: row.promoImage,
        discountPrice: row.discountPrice,
        product: {
          id: row.id, title: row.title, description: row.description, price: row.price,
          image: row.image, category: row.category, promotionalPrice: row.promotionalPrice
        }
      }));
    } catch (e) { return []; }
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

  // Actualiza datos parciales del usuario (ej: Settings o Perfil) 
  async updateLocalUser(apiUser: any): Promise<void> {
    if (!this.db) return;
    try {
        // Mapeo de campos API (snake_case) -> DB Local
        const name = apiUser.name || '';
        const nickname = apiUser.nickname || '';
        const phone = apiUser.phone || '';
        const address = apiUser.address || '';
        const gender = apiUser.gender || '';
        const country = apiUser.country || '';
        const image = apiUser.image || ''; // URL
        
        // Settings
        const allowNotif = apiUser.allow_notifications ? 1 : 0;
        const allowCam = apiUser.allow_camera ? 1 : 0;

        await this.db.runAsync(
          `UPDATE users SET 
            name=?, nickname=?, phone=?, address=?, gender=?, country=?, image=?, 
            allowNotifications=?, allowCamera=?
           WHERE id=?`,
          [name, nickname, phone, address, gender, country, image, allowNotif, allowCam, apiUser.id]
        );
        console.log("✅ Perfil actualizado localmente desde API");
    } catch (error) {
        console.error("❌ Error updateLocalUser:", error);
    }
  }

  // Obtener TODOS los productos (Para Admin)
  async getAllProductsAdmin(): Promise<any[]> {
    if (!this.db) return [];
    try {
      // Hacemos un LEFT JOIN para saber si tiene promo (activa o pausada)
      const query = `
        SELECT p.*, pr.id as promoId, pr.discountPrice as promoPriceAdmin, pr.visible as promoVisible
        FROM products p
        LEFT JOIN promotions pr ON p.id = pr.productId
        ORDER BY p.id DESC
      `;
      const products = await this.db.getAllAsync(query);
      
      return products.map((p: any) => ({
        ...p,
        subtitle: p.subtitle || '',
        description: p.description || '',
        visible: p.visible === 1,
        price: p.price.toString(),
        // Para el Admin, mostramos el precio promo si existe registro, aunque esté pausado
        promotionalPrice: p.promoPriceAdmin ? p.promoPriceAdmin.toString() : undefined,
        promotionId: p.promoId, // Para que el modal sepa editar
        isPromoActive: p.promoVisible === 1 // Para pintar UI diferente si quieres
      }));
    } catch (error) { return []; }
  }

  

  // Eliminar producto localmente
  async deleteProduct(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM promotions WHERE productId = ?', [id]);
    await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  }



  async getPromotionByProductId(productId: number): Promise<any | null> {
    if (!this.db) return null;
    try {
      // Buscamos la promoción ligada al producto
      return await this.db.getFirstAsync('SELECT * FROM promotions WHERE productId = ?', [productId]);
    } catch (error) {
      console.error("Error getPromotionByProductId:", error);
      return null;
    }
  }
}



export default new DatabaseService();