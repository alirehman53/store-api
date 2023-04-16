const Product = require('../models/product')

const getAllProductsStatic = async (req, res)=>{
    const products = await Product.find({})
    
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res)=>{
    const {featured, company, name, sort, fields, numericFilters} = req.query;
    let sortList = '';
    let fieldList = '';
    const queryObject = {}
    if(featured){
        queryObject.featured = featured === 'true' ? true: false;
    }

    if(company){
        queryObject.company = company;
    }

    if(name){
        queryObject.name = {$regex:name, $options: 'i'};
    }
    if(sort){
        sortList = sort?.split(',')?.join(' ')
    }else{
        sortList = 'createAt'
    }

    if(fields){
        fieldList = fields?.split(',')?.join(' ')
    }

    if(numericFilters){
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        };
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        const options = ['price', 'rating'];
        let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        );
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) };
            }
        });

    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page-1)*limit

    let result = await Product
    .find(queryObject)
    .sort(sortList)
    .select(fieldList)
    .skip(skip)
    .limit(limit)
    

    const products = await result;
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = { getAllProducts, getAllProductsStatic }