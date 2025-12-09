import * as SQLite from 'expo-sqlite';
import { ProductFormData, PromotionFormData, AdminProfileFormData } from '../../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if(this.db){
      console.log("La base de datos ya esta inicializada")
      return;
    }
    try {
      this.db = await SQLite.openDatabaseAsync('comecon.db');
      await this.createTables();
      await this.seedInitialData();
      console.log(' Base de datos SQLite inicializada.');
    } catch (error) {
      console.error(' Error inicializando DB:', error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;
    try {
      // 1. Usuarios (ACTUALIZADO CON MÁS CAMPOS)
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      
      // 2. Productos
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          subtitle TEXT,
          price REAL NOT NULL,
          description TEXT,
          image TEXT,
          category TEXT,
          visible INTEGER DEFAULT 1
        );
      `);

      // 3. Promociones
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS promotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          productId INTEGER NOT NULL,
          promotionalPrice REAL NOT NULL,
          startDate TEXT,
          endDate TEXT,
          visible INTEGER DEFAULT 1,
          FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
        );
      `);

      // 4. Órdenes
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          date TEXT NOT NULL,
          deliveryTime TEXT,
          historyNotes TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);
      
      // 5. Items de Orden
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER NOT NULL,
          productId INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          priceAtMoment REAL NOT NULL,
          FOREIGN KEY (orderId) REFERENCES orders (id),
          FOREIGN KEY (productId) REFERENCES products (id)
        );
      `);
    } catch (error) {
      console.error('Error creando tablas:', error);
    }
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) return;
    const userCheck = await this.db.getFirstAsync('SELECT * FROM users LIMIT 1');
    if (!userCheck) {
      console.log('🌱 Sembrando datos iniciales...');
      
      // Insertamos Admin con datos completos
      await this.db.runAsync(
        'INSERT INTO users (email, password, name, nickname, role, phone, gender, country, address, allowNotifications, allowCamera) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        ['admin1@comecon.com', '12345678a', 'Samantha Rios Bosques', 'Sam', 'administrador', '3512040011', 'Femenino', 'Mexico', 'Av. Virrey de Almanza #500', 1, 1]
      );
        
      // Insertamos Cliente
      await this.db.runAsync(
        'INSERT INTO users (email, password, name, nickname, role, phone, gender, country, address, allowNotifications, allowCamera) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        ['cliente1@comecon.com', '12345678a', 'Juan Pérez', 'Juancho', 'cliente', '3512345678', 'Masculino', 'Mexico', 'Calle Falsa 123', 1, 1]
      );
      
      const products = [
        ['Bowl con Frutas', 'Fresa, kiwi, avena', 120.99, 'Bowl fresco con frutas de temporada y granola.', 'bowlFrutas', 1],
        ['Tostada', 'Aguacate', 150.80, 'Tostada integral con aguacate fresco y huevo.', 'tostadaAguacate', 1],
        ['Panqueques', 'Avena y Frutas', 115.99, 'Torre de panqueques saludables con miel.', 'Panques', 1],
        ['Cafe Panda', 'Latte', 110.00, 'Café latte artesanal con diseño de panda.', 'cafePanda', 1]
      ];
      for (const p of products) {
        await this.db.runAsync('INSERT INTO products (title, subtitle, price, description, image, visible) VALUES (?, ?, ?, ?, ?, ?)', p);
      }
      // --- ORDENES DE PRUEBA ---
        // Orden 1: En Proceso (Bowl)
        await this.db.runAsync('INSERT INTO orders (userId, total, status, date, deliveryTime, historyNotes) VALUES (?, ?, ?, ?, ?, ?)', [2, 120.99, 'process', '2025-10-27', '7:30pm', '']);
        await this.db.runAsync('INSERT INTO order_items (orderId, productId, quantity, priceAtMoment) VALUES (?, ?, ?, ?)', [1, 1, 1, 120.99]); // Bowl

        // Orden 2: Completada (Cafe Panda)
        await this.db.runAsync('INSERT INTO orders (userId, total, status, date, deliveryTime, historyNotes) VALUES (?, ?, ?, ?, ?, ?)', [2, 110.00, 'completed', '2025-10-26', 'Entregado 8:00pm', 'Cliente feliz']);
        await this.db.runAsync('INSERT INTO order_items (orderId, productId, quantity, priceAtMoment) VALUES (?, ?, ?, ?)', [2, 4, 1, 110.00]); // Cafe

        // Orden 3: Cancelada (Tostada)
        await this.db.runAsync('INSERT INTO orders (userId, total, status, date, deliveryTime, historyNotes) VALUES (?, ?, ?, ?, ?, ?)', [2, 150.80, 'cancelled', '2025-10-25', 'Cancelado 9:00am', 'Falta de aguacate']);
        await this.db.runAsync('INSERT INTO order_items (orderId, productId, quantity, priceAtMoment) VALUES (?, ?, ?, ?)', [3, 2, 1, 150.80]); // Tostada

    }
  }

  // --- USUARIOS ---

  // Agregar método para actualizar configuraciones
  async updateUserSettings(email: string, settings: { allowNotifications: boolean, allowCamera: boolean }): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync(
        'UPDATE users SET allowNotifications = ?, allowCamera = ? WHERE email = ?',
        [settings.allowNotifications ? 1 : 0, settings.allowCamera ? 1 : 0, email]
      );
      return true;
    } catch (error) { return false; }
  }

  async loginUser(email: string, password: string): Promise<any> {
    if (!this.db) return null;
    return await this.db.getFirstAsync('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  }

  // Obtener usuario por Email (Para cargar el perfil)
  async getUserByEmail(email: string): Promise<any> {
    if (!this.db) return null;
    return await this.db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Actualizar Perfil de Usuario
  async updateUserProfile(email: string, data: AdminProfileFormData): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync(
        `UPDATE users SET name = ?, nickname = ?, phone = ?, gender = ?, country = ?, address = ? WHERE email = ?`,
        [data.fullName, data.nickname, data.phone, data.gender, data.country, data.address, email]
      );
      return true;
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      return false;
    }
  }

  async updateUserImage(email: string, imageUri: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.runAsync('UPDATE users SET image = ? WHERE email = ?', [imageUri, email]);
      return true;
    } catch (error) {
      console.error("Error updating image:", error);
      return false;
    }
  }

  async registerUser(userData: { name: string, email: string, phone: string, password: string }): Promise<boolean> {
    if (!this.db) return false;
    try {
      const existing = await this.db.getFirstAsync('SELECT id FROM users WHERE email = ?', [userData.email]);
      if (existing) return false;
      await this.db.runAsync('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [userData.name, userData.email, userData.phone, userData.password, 'cliente']);
      return true;
    } catch { return false; }
  }

  async checkUserExists(emailOrPhone: string): Promise<boolean> {
    if (!this.db) return false;
    const user = await this.db.getFirstAsync('SELECT id FROM users WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone]);
    return !!user;
  }

  async updatePassword(emailOrPhone: string, newPassword: string): Promise<boolean> {
    if (!this.db) return false;
    const res = await this.db.runAsync('UPDATE users SET password = ? WHERE email = ? OR phone = ?', [newPassword, emailOrPhone, emailOrPhone]);
    return res.changes > 0;
  }

  // --- PRODUCTOS ---

  async getProducts(): Promise<any[]> {
    if (!this.db) return [];
    try {
      const query = `
        SELECT p.*, pr.promotionalPrice, pr.visible as promoVisible
        FROM products p
        LEFT JOIN promotions pr ON p.id = pr.productId AND pr.visible = 1
        ORDER BY p.id DESC
      `;
      const products = await this.db.getAllAsync(query);

      return products.map((p: any) => ({
        ...p,
        visible: p.visible === 1,
        price: p.price.toString(), 
        promotionalPrice: p.promotionalPrice != null ? p.promotionalPrice.toString() : undefined
      }));
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  }

  async addProduct(product: any): Promise<void> {
    if (!this.db) return;
    try {
      const image = product.image || 'logoApp';
      const visible = product.visible !== false ? 1 : 0; 
      await this.db.runAsync(
        'INSERT INTO products (title, subtitle, price, description, image, visible) VALUES (?, ?, ?, ?, ?, ?)',
        [product.title, product.subtitle, parseFloat(product.price), product.description, image, visible]
      );
    } catch (error) { throw error; }
  }

  async updateProduct(id: number, product: Partial<ProductFormData> & { image?: string }): Promise<void> {
    if (!this.db) return;
    try {
      let query = 'UPDATE products SET title=?, subtitle=?, price=?, description=?, visible=?';
      const params: any[] = [product.title, product.subtitle, parseFloat(product.price!), product.description, product.visible?1:0];
      
      if (product.image) {
        query += ', image=?';
        params.push(product.image);
      }
      
      query += ' WHERE id=?';
      params.push(id);

      await this.db.runAsync(query, params);
    } catch (error) { throw error; }
  }
  
  async deleteProduct(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  }

  // --- PROMOCIONES ---

  async createPromotion(productId: number, promoData: PromotionFormData): Promise<void> {
    if (!this.db) return;
    try {
      const existing = await this.db.getFirstAsync('SELECT id FROM promotions WHERE productId = ?', [productId]);
      const visible = promoData.visible !== false ? 1 : 0;
      const price = parseFloat(promoData.promotionalPrice);

      if (existing) {
        await this.db.runAsync(
          'UPDATE promotions SET promotionalPrice = ?, startDate = ?, endDate = ?, visible = ? WHERE productId = ?',
          [price, promoData.startDate, promoData.endDate, visible, productId]
        );
      } else {
        await this.db.runAsync(
          'INSERT INTO promotions (productId, promotionalPrice, startDate, endDate, visible) VALUES (?, ?, ?, ?, ?)',
          [productId, price, promoData.startDate, promoData.endDate, visible]
        );
      }
    } catch (error) { throw error; }
  }

  async deletePromotion(productId: number): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.runAsync('DELETE FROM promotions WHERE productId = ?', [productId]);
    } catch (error) { throw error; }
  }

  async getPromotionByProductId(productId: number): Promise<any | null> {
    if (!this.db) return null;
    try {
      return await this.db.getFirstAsync('SELECT * FROM promotions WHERE productId = ?', [productId]);
    } catch (error) {
      return null;
    }
  }

  async debugCheckDB(): Promise<void> {
    if (!this.db) return;
    const products = await this.db.getAllAsync('SELECT * FROM products');
    console.log(`📦 Productos: ${products.length}`);
  }

  // --- NUEVOS MÉTODOS PARA ÓRDENES ---

  // Obtener todas las órdenes uniendo con productos para tener la imagen y título principal
  async getOrders(): Promise<any[]> {
    if (!this.db) return [];
    try {
      // Hacemos JOIN para obtener los datos del producto asociado a la orden (asumimos 1 producto principal por visualización)
      const query = `
        SELECT 
          o.id, o.status, o.total, o.date, o.deliveryTime, o.historyNotes,
          p.title, p.subtitle, p.image
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        JOIN products p ON oi.productId = p.id
        GROUP BY o.id 
        ORDER BY o.id DESC
      `;
      const orders = await this.db.getAllAsync(query);
      
      // Formateamos para cumplir con la interfaz de UI
      return orders.map((o: any) => ({
        id: o.id.toString(),
        title: o.title,
        subtitle: o.subtitle,
        price: o.total.toString(),
        image: o.image || 'logoApp', // Manejo de imagen
        status: o.status,
        date: o.date,
        deliveryTime: o.deliveryTime,
        historyNotes: o.historyNotes
      }));
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      return [];
    }
  }

  // Actualizar el estado de una orden (ej. de 'process' a 'completed')
  async updateOrderStatus(orderId: number, status: string, notes?: string, time?: string): Promise<void> {
    if (!this.db) return;
    try {
      let query = 'UPDATE orders SET status = ?';
      const params: any[] = [status];

      if (notes) {
        query += ', historyNotes = ?';
        params.push(notes);
      }
      if (time) {
        query += ', deliveryTime = ?';
        params.push(time);
      }
      
      query += ' WHERE id = ?';
      params.push(orderId);

      await this.db.runAsync(query, params);
      console.log(`Orden ${orderId} actualizada a ${status}`);
    } catch (error) {
      console.error("Error actualizando orden:", error);
      throw error;
    }
  }
}



export default new DatabaseService();