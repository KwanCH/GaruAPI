import nodemailer from 'nodemailer';

//TODO Funksjon som generer verification kode og sendertil brukere
//TODO Funksjon som sjekker at koden bruker skrev inn stemmer med verification koden vi sendte ut


export const sendTheEmail = async (email, validationCode) => {
    console.log('Call to `/sendTheEmail` endpoint')

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'uiosmartwatch.ak@gmail.com',
            pass: 'aqqbgmcbrqsanpog'
        }
    });

    var mailOptions = {
        from: 'uiosmartwatch.ak@gmail.com',
        to: email,
        subject: 'Validate your email',
        //text: `If this is your mail... If this is you open http://172.26.0.244:8080/api/validateEmail?email=${email}&code=${validationCode}/`
        text: `If this is your mail... If this is you open http://garu.uiocloud.no/api/validateEmail?email=${email}&code=${validationCode}/`
    };


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            reject()
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
//Hentet fra https://www.w3schools.com/nodejs/nodejs_email.asp


//Email Validator https://www.npmjs.com/package/email-validator




