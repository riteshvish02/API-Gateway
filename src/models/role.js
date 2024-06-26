'use strict';
const {
  Model
} = require('sequelize');
const {ENUMS} = require("../utils/common")
const {ADMIN,CUSTOMER,FLIGHT_COMPANY} = ENUMS.Roles;
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.user, {through: 'user_roles', as: 'user'});
      // define association here
    }
  }
  Role.init({
    name: {
      type: DataTypes.ENUM({
        values:[ADMIN,CUSTOMER,FLIGHT_COMPANY]
      }),
      defaultValue:CUSTOMER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};