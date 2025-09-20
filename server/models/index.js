const { Sequelize } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./User');
const Donation = require('./Donation');
const Product = require('./Product');
const Category = require('./Category');
const Variant = require('./Variant');
const ProductImage = require('./ProductImage');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = User;
db.Donation = Donation;
db.Product = Product;
db.Category = Category;
db.Variant = Variant;
db.ProductImage = ProductImage;

// Устанавливаем связи между моделями ТОЛЬКО В ЭТОМ ФАЙЛЕ

// Связи пользователь-пожертвование
User.hasMany(Donation, {
  foreignKey: 'userId',
  as: 'donations',
});
Donation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Связи категория-товар
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Связи товар-варианты
Product.hasMany(Variant, {
  foreignKey: 'product_id',
  as: 'variants',
});
Variant.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Связи товар-изображения
Product.hasMany(ProductImage, {
  foreignKey: 'product_id',
  as: 'images',
});
ProductImage.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Связи пользователь-избранное
User.belongsToMany(Product, {
  through: 'UserFavorites',
  as: 'favorites',
  foreignKey: 'userId',
});
Product.belongsToMany(User, {
  through: 'UserFavorites',
  as: 'favoritedBy',
  foreignKey: 'productId',
});

module.exports = db;
