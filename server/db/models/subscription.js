"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Topic, { foreignKey: "topic_id", targetKey: "id" });
    }
  }
  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true,
      },
      topic_id: { type: DataTypes.UUID, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Subscription",
      timestamps: false,
    }
  );
  return Subscription;
};
