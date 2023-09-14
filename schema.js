const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        community: Joi.string().required(),
        author: Joi.string().required(),
        image: Joi.string().required(),
        text: Joi.string().required(),
        upvote: Joi.number().required(),
        downvote: Joi.number().required()
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    }).required()
})