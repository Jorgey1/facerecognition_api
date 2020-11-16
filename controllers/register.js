const handleRegister = (req, res, bcrypt, db) => {
    if(!db || typeof db.transaction !== "function") {
        return res.status(200).json("fuck me");
    }
    const {email, name, password} = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission')
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        console.log(trx)
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail ? loginEmail[0] : "jorge@gmail.com",
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    return res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(4500).json('Unable to Register'))
}

module.exports = {
    handleRegister
};