const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        community: Joi.string().required(),
        image: Joi.string().required(),
        text: Joi.string().required()

    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    }).required()
})