const express = require("express");
const router = express.Router();
const CategoryModel = require("../Models/CategoryModel");

// Get All Categories
router.get("/", async (req, res) => {
    try {
        const categories = await CategoryModel.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Categories could not be retrieved", error: err.message });
    }
});

// Get Category by ID
router.get("/:id", async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving category", error: err.message });
    }
});

// Create a new Category
router.post("/", async (req, res) => {
    try {
        const newCategory = await CategoryModel.create(req.body);
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: "Category could not be added", error: err.message });
    }
});

// Update a Category
router.put("/:id", async (req, res) => {
    try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category updated successfully", category: updatedCategory });
    } catch (err) {
        res.status(500).json({ message: "Error updating category", error: err.message });
    }
});

// Delete a Category
router.delete("/:id", async (req, res) => {
    try {
        const deletedCategory = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err.message });
    }
});

module.exports = router; 