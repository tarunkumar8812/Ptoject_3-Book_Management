const bookModel = require('../model/bookModel')
const userModel = require("../model/userModel")
const mongoose = require("mongoose")
const moment = require("moment")
const ObjectId = mongoose.Types.ObjectId.isValid




//<=======================Create Book API=================================>
const createBook = async function (req, res) {
    try {

        let data = req.body;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please enter require data to create Book" })
        }
        let { title, excerpt, userId, ISBN, category, subcategory, reviews ,releasedAt, isDeleted} = data;

        if (!title) {
            return res.status(400).send({ status: false, msg: "Title is mandatory" })
        }
        if (typeof (title) !== "string") {
            return res.status(400).send({ status: false, msg: "Title will be in string format only" })
        }
        let checktitle = await bookModel.findOne({ title: title })

        if (checktitle) {
            return res.status(400).send({ status: false, message: "This title is already taken" })
        }
        // if (!/^[a-zA-Z \s]+$/.test(title)) {
        //     return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in title" })
        // }
        if (!excerpt) {
            return res.status(400).send({ status: false, msg: "Excerpt is mandatory" })
        }
        if (!/^[a-zA-Z \s]+$/.test(excerpt)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in excerpt" })
        }
        if (!userId) {
            return res.status(400).send({ status: false, msg: "UserId is mandatory" })
        }
        if (!ObjectId(userId)) { return res.status(400).send({ status: false, msg: "userId is not in format" }) }

        let user = await userModel.findById({ _id: userId })

        if (!user) {
            return res.status(404).send({ status: false, msg: "No such user exist" })
        }

        if (!ISBN) {
            return res.status(400).send({ status: false, msg: "ISBN is mandatory" })
        }
        if (!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN)) {
            return res.status(400).send({ status: false, message: 'Please provide a valid ISBN(ISBN should be 13 digit e.g 978-0-596-52068-7)' })
        }

        let checkISBN = await bookModel.findOne({ ISBN: ISBN })

        if (checkISBN) {
            return res.status(400).send({ status: false, message: "ISBN Already Exists" })
        }

        if (!(category.trim())) {
            return res.status(400).send({ status: false, msg: "Category is mandatory" })
        }
        if (!/^[a-zA-Z \s]+$/.test(category)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in Category" })
        }

        if (!(subcategory.trim())) {
            return res.status(400).send({ status: false, msg: "Subcategory is mandatory" })
        }
        if (!/^[a-zA-Z \s]+$/.test(subcategory)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Alphabets in subcategory" })
        }


        if(reviews){if(typeof (reviews) !== "number"&& reviews !=0){
            return res.status(400).send({ status: false, msg: "Reviews will be in number format only and should be 0 while creating book" })
        }}
        
        if (releasedAt) {
            if (!/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) return res.status(400).send({ status: false, message: "Enter date in YYYY-MM-DD format" });
            releasedAt = new Date().toISOString()
        }
        //Creating Data Here
        if (!releasedAt) {
            let date = Date.now()                                               //getting timestamps value
            releasedAt = moment(date).format('YYYY-MM-DD, hh:mm:ss')        //formatting date
            data['releasedAt'] = releasedAt
        }
        if(isDeleted){
            data.isDeleted = false
        }

        let savedData = await bookModel.create(data)
        return res.status(201).send({ status: true, msg: "success", data: savedData })

    }
    catch (err) {
        return res.status(500).send({ status: false, mag: err.message })
    }
}







//<----------------------Get Books API --------------------->
const books = async function (req, res) {
    try {
        let queries = req.query
        console.log(queries);

        if (Object.keys(queries).length == 0) {
            let bookList = await bookModel.find({ isDeleted: false }).select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0, __v: 0 })

            if (bookList.length == 0) return res.status(404).send({ status: false, msg: "No data found" })

            return res.status(200).send({ status: true, msg: "list of Books", data: bookList })
        }

        const { userId, category, subcategory } = req.query
        const filter = { isDeleted: false }

        if (userId != undefined && userId.trim() != "") {
            if (!ObjectId(userId.trim())) { return res.status(400).send({ status: false, msg: "Invalid UserId" }) }
            filter.userId = userId.trim()
        }
        if (category != undefined && category.trim() != "") { filter.category = category.trim() }
        if (subcategory != undefined && subcategory.trim() != "") { filter.subcategory = subcategory.trim() }

        console.log(filter);

        let bookList = await bookModel.find(filter).select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0, __v: 0 })
        if (bookList.length == 0) return res.status(404).send({ status: false, msg: "No data found" })


        return res.status(200).send({ status: true, msg: "list of Books", data: bookList })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}


//<=======================Get Book by bookId API=================================>

const getParticularBook = async function(req, res){
  
        let bookId = req.params.bookId
        if(!ObjectId(bookId)) return res.status(400).send({status:false, message:" Invalid bookId"})

         let book = await bookModel.findById({_id:bookId })

         if(!book) return res.status(404).send({status: false,message: "bookId is not found" })
        res.status(200).send({status:true, data: book})
   

}




module.exports = { createBook , getParticularBook, books }