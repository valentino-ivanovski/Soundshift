const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("adminCommentsList route reached");
    res.render("adminCommentsList");
})

router.get('/getComments', (req, res) => {
    dbConn.getComments((err, comments) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.status(500).send("Error fetching comments");
        } else{
            res.json(comments);
        }
    });
});

router.get('/deleteComment/:comment_id', (req, res) => {
    const id = req.params.comment_id;
    dbConn.deleteComment(id, (err, result) => {
        if (err) {
            console.error("Error deleting comment:", err);
            return res.status(500).send("Error deleting comment");
        } else {
            res.render("adminCommentsList");
        }
    });
});

module.exports = router;