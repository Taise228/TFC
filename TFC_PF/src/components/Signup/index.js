import React from 'react';
import './style.css'
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = (props) => {
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState({});
    const [avatar, setAvatar] = useState(new Blob());

    const handleChangeEmail = (e) => { setEmail(e.target.value); validation("email", e.target.value) };
    const handleChangeFirstName = (e) => { setFirstName(e.target.value); validation("first_name", e.target.value); };
    const handleChangeLastName = (e) => { setLastName(e.target.value); validation("last_name", e.target.value); };
    const handleChangePhoneNumber = (e) => { setPhoneNumber(e.target.value); validation("phone_number", e.target.value); };
    const handleChangeAvatar = (e) => {
        const files = e.target.files;
        //console.log(files[0])
        setAvatar(...files);
    };
    const handleChangePassword = (e) => { setPassword(e.target.value); validation("password", e.target.value); };
    const handleChangePassword2 = (e) => { setPassword2(e.target.value); validation("password2", e.target.value) };

    const [errors, setErrors] = useState({
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        avatar: "",
        password: {empty: "", digit: "", lowercase: "", uppercase: "", length: "", sign: ""},
        password2: "",
    })

    const validation = (field, value) => {
        switch(field) {
            case 'email':
                const re_email = new RegExp(/^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+(\.[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+)*@(([a-zA-Z0-9]+-+)*[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*|([a-zA-Z0-9]+-+)*[a-zA-Z]+[a-zA-Z0-9]*-+([a-zA-Z0-9]+-+)*[a-zA-Z0-9]+)\.(([a-zA-Z0-9]+-+)*[a-zA-Z0-9]+\.)*[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/);
                if (value === ""){
                    setErrors({...errors, email: "This field is required"});
                }else if (!re_email.test(value)){
                    setErrors({...errors, email: "Email is invalid"});
                }else{
                    setErrors({...errors, email: ""});
                }
                break;
            case 'first_name':
                if (value === ""){
                    setErrors({...errors, first_name: "This field is required"});
                }else{
                    setErrors({...errors, first_name: ""});
                }
                break;
            case 'last_name':
                if (value === ""){
                    setErrors({...errors, last_name: "This field is required"});
                }else{
                    setErrors({...errors, last_name: ""});
                }
                break;
            case 'password':
                let flag = false;
                const re_digit = new RegExp(/\d/);
                const re_lowercase = new RegExp(/[a-z]/);
                const re_uppercase = new RegExp(/[A-Z]/);
                const re_sign = new RegExp(/[!@#$%^&*]/);
                const pass_erorr = {};

                if (value === ""){
                    flag = true;
                    pass_erorr.empty = "This field is required";
                }else{
                    pass_erorr.empty = "";
                }
                if (value.length < 8){
                    flag = true;
                    pass_erorr.length = "password must be more than 7 characters";
                }else {
                    pass_erorr.length = "";
                }
                if (!re_digit.test(value)){
                    flag = true;
                    pass_erorr.digit = "password must contain at least one digit";
                }else {
                    pass_erorr.digit = "";
                }
                if (!re_lowercase.test(value)){
                    flag = true;
                    pass_erorr.lowercase = "password must contain at least one lowercase letter";
                }else {
                    pass_erorr.lowercase = "";
                }
                if (!re_uppercase.test(value)){
                    flag = true;
                    pass_erorr.uppercase = "password must contain at least one uppercase letter";
                }else {
                    pass_erorr.uppercase = "";
                }
                if (!re_sign.test(value)){
                    flag = true;
                    pass_erorr.sign = "password must contain at least one letter from [!, @, #, $, %, ^, &, *]";
                }else {
                    pass_erorr.sign = "";
                }

                if (!flag){
                    setErrors({...errors, password: {}});
                }else {
                    setErrors({...errors, password: pass_erorr})
                }
                break;
            case "password2":
                if (value !== password){
                    setErrors({...errors, password2: "passwords do not match"});
                }else{
                    setErrors({...errors, password2: ""});
                }
                break;
            default: break;
        }
    }

    const [signed_up, setSignedUp] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let pass_error = false
        for (let msg in errors.password){
            if (msg !== ""){
                pass_error = true;
                break;
            }
        }
        if (errors.email!=="" || errors.first_name!=="" || errors.last_name!=="" || errors.password2!=="" || pass_error){
            console.log("there're errors");
            setError({e: "Please input correct form"});
        }else{
            setError({});
            const submitData = new FormData();
            //submitData.append("formData", JSON.stringify({email: email, first_name: first_name, last_name: last_name, phone_number: phone_number, password: password}));
            submitData.append("email", email);
            submitData.append("first_name", first_name);
            submitData.append("last_name", last_name);
            submitData.append("phone_number", phone_number);
            if (avatar !== undefined && avatar.size !== 0){
                submitData.append("avatar", avatar);
            }
            submitData.append("password", password);
            axios.post(props.base_url + 'accounts/signup/', submitData)
                .then((res) => {
                    console.log(res);
                    setSignedUp(true);
                })
                .catch((err) => {
                    console.log(err.response.data);
                    setError(err.response.data);
                });
            /*const requestOptions ={
                method: 'POST',
                headers:{'Content-Type': 'multipart/form-data'},
                body: submitData,
            };
            fetch(props.base_url + 'accounts/signup/', requestOptions)*/
            console.log("submit");
        }
    }

    //<form action={props.base_url + 'accounts/signup/'} method="POST" encType="multipart/form-data">

    if (signed_up){
        return (
            <>
            <div className='container'>
                <p>Successfly registered!</p>
                <Link to="/login/">login</Link>
            </div>
            </>
        );
    }
    return (
        <>
        <div className='container'>
            <h1>Signup</h1>
            <p>Please fill in these forms</p>
            <p>*: required</p>

            <div className='search signup'>

                <label htmlFor='email'>Email*&emsp;
                    <input id='email' name='email' type='email' value={email} onChange={handleChangeEmail}></input>
                </label>
                <p className='notification' id='email_notification'>{errors.email}</p> <br/>

                <label htmlFor='first_name'>First name*&emsp;
                    <input id='first_name' name='first_name' type='text' value={first_name} onChange={handleChangeFirstName}></input> 
                </label>
                <p className='notification' id='first_name_notification'>{errors.first_name}</p> <br/>

                <label htmlFor='last_name'>Last name*&emsp;
                    <input id='last_name' name='last_name' type='text' value={last_name} onChange={handleChangeLastName}></input> 
                </label>
                <p className='notification' id='last_name_notification'>{errors.last_name}</p> <br/>

                <label htmlFor='phone_number'>Phone number&emsp;
                    <input id='phone_number' name='phone_number' type='text' value={phone_number} onChange={handleChangePhoneNumber}></input> 
                </label>
                <p className='notification' id='phone_number_notification'>{errors.phone_number}</p> <br/>

                <label htmlFor='avatar'>Your avatar&emsp;
                    <input id='avatar' name='avatar' type='file' alt='your avatar' onChange={handleChangeAvatar}></input> 
                </label>
                <p className='notification' id='avatar_notification'>{errors.avatar}</p> <br/>

                <label htmlFor='password'>Password*&emsp;
                    <input id='password' name='password' type='password' value={password} onChange={handleChangePassword}></input> 
                </label> <br />
                <p className='notification' id='password_notification'>{Object.keys(errors.password).map((i) => {
                    if (errors.password[i] !== ""){
                        return (<li key={i}>{errors.password[i]}</li>);}
                    else{
                        return (<></>)
                    }
                    })}</p> <br/>
                    

                <label htmlFor='password2'>Password confirmation*
                    <input id='password2' name='password2' type='password' value={password2} onChange={handleChangePassword2}></input> 
                </label> <br />
                <p className='notification' id='password2_notification'>{errors.password2}</p> <br/>
            </div>

            <p className='notification'>{Object.keys(error).map((i) => {return (<>{i}<li key={i}>{error[i]}</li></>);})}</p>
            <button id='signup' type='submit' onClick={handleSubmit}>Submit</button>
        </div>
        </>
    )
}

export default Signup;