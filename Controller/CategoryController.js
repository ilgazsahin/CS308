const express = require('express');
const router = express.Router();
const CategoryModel = require("../Models/CategoryModel");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await CategoryModel.find({}, "name"); // sadece name field
    const categoryList = categories.map(cat => cat.name);
    res.json(categoryList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

// Add a new category
// POST /api/categories ➜ yeni kategori ekle
router.post("/", async (req, res) => {
  const { category } = req.body;

  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({ message: "Invalid category" });
  }

  try {
    const existing = await CategoryModel.findOne({ name: category.trim() });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const newCategory = new CategoryModel({ name: category.trim() });
    await newCategory.save();

    res.status(201).json({ message: "Category added", category: newCategory });
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Delete a category
router.delete("/:category", async (req, res) => {
  const categoryToDelete = req.params.category;

  try {
    // ↓ burada muhtemelen CategoryModel eksik ya da yanlış
    const result = await CategoryModel.deleteOne({ name: categoryToDelete });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
});


module.exports = router;
