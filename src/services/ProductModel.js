import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] },
  status: { type: Boolean, default: true },
});

// Asegúrate de definir primero el esquema antes de aplicar plugins
productSchema.plugin(mongoosePaginate);

// Crea y exporta el modelo
const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;