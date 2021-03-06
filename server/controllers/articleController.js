const Article = require('../models/articleModel')
const Comment = require('../models/commentModel')

module.exports = {
    
    show: function(req, res) {
        Article.find({}, null, {
            sort: {
                title: 'ASC'
            }
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    showOne: function(req, res) {
        Article.findById(req.params.id)
        .populate('author')
        .populate({
            path: 'comments',
            populate: {
                path: 'commenter'
            }
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'comments',
                populate: {
                    path: 'commenter'
                }
            }
        })
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    showMine: function(req, res) {
        Article.find({
            author: req.userId
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    add: function(req, res) {
        if ((!req.body.title && !req.body.content) || (req.body.title.length === 0 && req.body.content.length === 0)) {
            res.status(500).json({message: 'An article has to have a title and a content'})
        } else if (!req.body.title || req.body.title.length === 0) {
            res.status(500).json({message: 'An article has to have a title'})
        } else if (!req.body.content || req.body.content.length === 0) {
            res.status(500).json({message: 'An article has to have a content'})
        } else {
            if (!req.body.image || req.body.image.length === 0) {
                req.body.image = 'https://via.placeholder.com/700x250'
            }
            Article.create({
                title: req.body.title,
                content: req.body.content,
                location: req.body.loc,
                author: req.userId,
                image: req.body.image
            })
            .then(data => {
                res.status(201).json({data: data})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    edit: function(req, res) {
        if ((!req.body.title && !req.body.content) || (req.body.title.length === 0 && req.body.content.length === 0)) {
            res.status(500).json({message: 'An article has to have a title and a content'})
        } else if (!req.body.title || req.body.title.length === 0) {
            res.status(500).json({message: 'An article has to have a title'})
        } else if (!req.body.content || req.body.content.length === 0) {
            res.status(500).json({message: 'An article has to have a content'})
        } else {
            Article.updateOne({
                _id: req.params.id,
                author: req.userId
            }, {
                title: req.body.title,
                content: req.body.content
            })
            .then(data => {
                res.status(200).json({data: data})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    remove: function(req, res) {
        Article.findById(req.params.id)
        .then(article => {
            if (article.comments.length === 0) {
                aDel()
            } else {
                Comment.find({
                    _id: {
                        $in: article.comments
                    }
                })
                .then(comments => {
                    for (let i = 0; i < comments.length; i++) {
                        if (comments[i].level === 1) {
                            Comment.deleteMany({
                                _id: {
                                    $in: comments[i].comments
                                }
                            })
                            .then(() => {
                                if (i === comments.length - 1) {
                                    cDel()
                                }
                            })
                            .catch(err => {
                                res.status(500).json({message: err})
                            })
                        } else {
                            if (i === comments.length - 1) {
                                cDel()
                            }
                        }
                    }
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })

                function cDel() {
                    Comment.deleteMany({
                        _id: {
                            $in: article.comments
                        }
                    })
                    .then(() => {
                        aDel()
                    })
                    .catch(err => {
                        res.status(500).json({message: err})
                    })
                }
            }

            function aDel() {
                Article.deleteOne({
                    _id: req.params.id,
                    author: req.userId 
                })
                .then(() => {
                    res.status(200).json({})
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            }
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    search: function(req, res) {
        Article.find({
            title: new RegExp(req.query.keyword, 'i')
        }, null, {
            sort: {
                title: 'ASC'
            }
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    }
}