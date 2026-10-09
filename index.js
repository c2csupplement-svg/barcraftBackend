import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import databaseConfig from "./src/config/db.js";
import ProductRouter from "./src/router/product.route.js";
import ProductCategoryRouter from "./src/router/productCategory.route.js"
import ReviewRouter from "./src/router/review.route.js"
import BannerRouter from "./src/router/banner.route.js";
import BlogRouter from "./src/router/blog.route.js";
import BlogCategoryRouter from "./src/router/blogCategory.route.js";
import ContactRouter from "./src/router/contact.route.js";
import FaqRouter from "./src/router/faq.route.js";
import InstagramRouter from "./src/router/instagram.route.js"
import RecipeParentCategoryRouter from "./src/router/recipeCategory.route.js";
import RecipeSubCategoryRouter from "./src/router/subRecipecategory.route.js";
import RecipeRouter from "./src/router/recipe.route.js";

dotenv.config();
databaseConfig();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
     origin: [
    'http://localhost:3000',
    'https://barcraftmixer.com',
    'https://www.barcraftmixer.com',
    'https://<admin-domain>',        // admin jis domain par khulta hai
  ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.use("/barcraft/api/product", ProductRouter);
app.use("/barcraft/api/product/category", ProductCategoryRouter);
app.use("/barcraft/api/reviews", ReviewRouter);
app.use("/barcraft/api/banner", BannerRouter);
app.use("/barcraft/api/blogs", BlogRouter);
app.use("/barcraft/api/blogcategory", BlogCategoryRouter);
app.use("/barcraft/api/contact", ContactRouter);
app.use("/barcraft/api/faq", FaqRouter);
app.use("/barcraft/api/instagram", InstagramRouter);
app.use("/barcraft/api/recipe/category/parent", RecipeParentCategoryRouter);
app.use("/barcraft/api/recipe/category/sub", RecipeSubCategoryRouter);
app.use("/barcraft/api/recipe", RecipeRouter);

app.listen(port, () => {console.log(`Server run on PORT: ${port}`)})


