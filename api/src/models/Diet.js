const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {

  sequelize.define('diet', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    
  },
  {
		timestamps: false
	});
};