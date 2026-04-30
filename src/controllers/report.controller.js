const db = require('../config/database');

class ReportController {
  // TODO: Implementasi endpoint laporan dengan query SQL kompleks
  static async getTopUsers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      
      const query = `
        SELECT 
          u.id, 
          u.name, 
          u.username, 
          u.email, 
          u.phone, 
          u.balance,
          COALESCE(SUM(t.total), 0) AS total_spent,
          RANK() OVER (ORDER BY COALESCE(SUM(t.total), 0) DESC) AS rank
        FROM 
          users u
        LEFT JOIN 
          transactions t ON u.id = t.user_id AND t.status = 'paid'
        GROUP BY 
          u.id
        ORDER BY 
          rank ASC
        LIMIT $1
      `;
      
      const result = await db.query(query, [limit]);
      
      // Parse total_spent sum
      const payload = result.rows.map(row => ({
        ...row,
        balance: parseInt(row.balance, 10),
        total_spent: parseInt(row.total_spent, 10),
        rank: parseInt(row.rank, 10)
      }));

      res.status(200).json({
        success: true,
        message: 'Top users retrieved successfully',
        payload: payload,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsSold(req, res, next) {
    try {
      const query = `
        SELECT 
          i.id, 
          i.name, 
          i.price, 
          i.stock,
          COALESCE(SUM(t.quantity), 0) AS total_quantity_sold,
          COALESCE(SUM(t.total), 0) AS total_revenue
        FROM 
          items i
        LEFT JOIN 
          transactions t ON i.id = t.item_id AND t.status = 'paid'
        GROUP BY 
          i.id
        ORDER BY 
          total_revenue DESC
      `;
      
      const result = await db.query(query);
      
      const payload = result.rows.map(row => ({
        ...row,
        price: parseInt(row.price, 10),
        stock: parseInt(row.stock, 10),
        total_quantity_sold: parseInt(row.total_quantity_sold, 10),
        total_revenue: parseInt(row.total_revenue, 10)
      }));

      res.status(200).json({
        success: true,
        message: 'Items sold retrieved successfully',
        payload: payload,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlySales(req, res, next) {
    try {
      const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
      
      const query = `
        SELECT 
          date_trunc('month', created_at) AS month,
          COUNT(id) AS transaction_count,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM 
          transactions
        WHERE 
          status = 'paid' AND
          EXTRACT(YEAR FROM created_at) = $1
        GROUP BY 
          month
        ORDER BY 
          month ASC
      `;
      
      const result = await db.query(query, [year]);
      
      const payload = result.rows.map(row => ({
        month: row.month,
        transaction_count: parseInt(row.transaction_count, 10),
        total_revenue: parseInt(row.total_revenue, 10)
      }));

      res.status(200).json({
        success: true,
        message: 'Monthly sales retrieved successfully',
        payload: payload,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;