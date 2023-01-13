import './style.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const User = (props) => {
    // userの編集、アカウント削除
    // subscription確認、加入
    // admin の時はsubscriptionの作成、クラスの作成、スタジオの作成、編集など

    const navigate = useNavigate()
    
    const [edit_mode, setEditMode] = useState(false);
    const [edit_password, setEditPassword] = useState(false);
    const [user_info, setUserInfo] = useState({});
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState({});
    const [avatar, setAvatar] = useState(new Blob());
    const [message, setMessage] = useState('');

    const location = useLocation();
    
    useEffect(() => {
        //localStorage.removeItem("access");
        // browser が開かれたときに一度だけ実行
        if (location.state){
            if (location.state.msg){
                setMessage(location.state.msg);
            }
        }
        
        const requestOptions = {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('access')},
        }
        fetch(props.base_url + 'accounts/profile/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (!data.detail){
                    setUserInfo({...data});
                    props.authentication(true);   // for nav bar
                    props.admin(data.is_staff);   // for nav bar
                    setEmail(data.email);
                    setFirstName(data.first_name);
                    setLastName(data.last_name);
                    setPhoneNumber(data.phone_number);
                    setPassword(data.password);
                }else {
                    props.authentication(false);
                    props.admin(false);
                    setUserInfo({});
                    navigate('/login/', {
                        state: {error: "please login"}
                    })
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }, [edit_mode, edit_password])

    //---------------------------------------------------------

    const handleChangeEmail = (e) => { setEmail(e.target.value); validation("email", e.target.value) };
    const handleChangeFirstName = (e) => { setFirstName(e.target.value); validation("first_name", e.target.value); };
    const handleChangeLastName = (e) => { setLastName(e.target.value); validation("last_name", e.target.value); };
    const handleChangePhoneNumber = (e) => { setPhoneNumber(e.target.value); validation("phone_number", e.target.value); };
    const handleChangeAvatar = (e) => {
        const files = e.target.files;
        //console.log(files[0])
        setAvatar(...files);
    };
    const handleChangePassword = (e) => { setPassword(e.target.value); validation_password("password", e.target.value); };
    const handleChangePassword2 = (e) => { setPassword2(e.target.value); validation_password("password2", e.target.value) };

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
            default: break;
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (errors.email!=="" || errors.first_name!=="" || errors.last_name!==""){
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
                console.log(avatar.size);
                submitData.append("avatar", avatar);
            }
            axios.patch(props.base_url + 'accounts/profile/', submitData, {headers: {Authorization: 'Bearer ' + localStorage.getItem('access')}})
                .then((res) => {
                    console.log(res);
                    setMessage("Your change has been made")
                    setEditMode(false);
                })
                .catch((err) => {
                    console.log(err.response.data);
                    setError(err.response.data);
                });
            console.log("submit");
        }
    }
    //---------------------------------------------------------
    const validation_password = (field, value) => {
        switch(field) {
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
            default:
                break;
        }
    }

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        let pass_error = false
        for (let msg in errors.password){
            if (msg !== ""){
                pass_error = true;
                break;
            }
        }
        if (pass_error || errors.password2 !== ''){
            console.log("there're errors");
            setError({e: "Please input correct form"});
        }else {
            const requestOptions = {
                method: "PATCH", 
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"password": password}),
            };
            fetch(props.base_url+'accounts/profile/', requestOptions)
                .then((res) => res.json())
                .then((data) => {
                    if (data.detail){
                        setError({detail: data.detail});
                        props.authentication(false);
                    }else {
                        setError({});
                        setMessage('Your password has been changed')
                        setEditPassword(false);
                    }
                })
                .catch((err) => {
                    setError({detail: err.toString()});
                })
        }
    }
    //---------------------------------------------------------

    if (edit_mode){
        return (
            <>
                <h2>Edit profile</h2>
                <div className='edit_out'>
                    <p>*: required</p>
                    <p>Input all the fields that you want to register</p>
                    <form method='PATCH' action={props.base_url + 'accounts/profile/'}>

                        <div className='edit_in'>
                            <label htmlFor='email'>Email* &emsp;
                                <input id='email' name='email' type='email' value={email} onChange={handleChangeEmail}></input>
                            </label>
                            <p className='notification' id='email_notification'>{errors.email}</p> <br/>

                            <label htmlFor='first_name'>First name* &emsp;
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

                            <label htmlFor='avatar'>Your avatar</label> <br />
                            {user_info.avatar ? <img src={user_info.avatar} /> : <div className='box' ><p className='None'>None</p></div>} <br />
                            <input id='avatar' name='avatar' type='file' alt='your avatar' onChange={handleChangeAvatar}></input> 
                            <p className='notification' id='avatar_notification'>{errors.avatar}</p> <br/>                        
                        </div>

                        <p className='notification'>{Object.keys(error).map((i) => {return (<><li key={i}>{error[i]}</li></>);})}</p>
                        <button id='edit_profile' type='submit' onClick={handleSubmit}>Submit</button>
                    </form>
                </div>

                <button type='button' onClick={() => {setMessage(''); setEditMode(false);}}>back</button>
            </>
        );
    }

    if (edit_password){
        return (
            <>
            <h2>Change password</h2>
            <div className='edit_out'>
                <form method='PATCH' action={props.base_url + 'accounts/profile/'}>
                    <div className='edit_in'>
                        <label htmlFor='password'>New Password*</label>
                        <input id='password' name='password' type='password' onChange={handleChangePassword}></input> 
                        <p className='notification' id='password_notification'>{Object.keys(errors.password).map((i) => {
                            if (errors.password[i] !== ""){
                                return (<li key={i}>{errors.password[i]}</li>);}
                            else{
                                return (<></>)
                            }
                            })}</p> <br/>
                            

                        <label htmlFor='password2'>Password confirmation*</label>
                        <input id='password2' name='password2' type='password' onChange={handleChangePassword2}></input> 
                        <p className='notification' id='password2_notification'>{errors.password2}</p> <br/>
                    </div>

                    <p className='notification'>{Object.keys(error).map((i) => {return (<li key={i}>{error[i]}</li>);})}</p>
                    <button id='edit_password' type='submit' onClick={handleSubmitPassword}>Submit</button>
                </form>
            </div>
            <button type='button' onClick={() => {setMessage(''); setEditPassword(false);}}>back</button>
            </>
        )
    }

    return (
        <>
        <div id='user_page'>
            <p className='message'>{message}</p>
            <div className='container'>
                <h2>User page</h2>
                <h3>Welcome, {user_info.first_name} {user_info.last_name}!</h3>
            </div>
            <hr/>
            <h3 style={{'backgroundColor': 'white'}}>menu</h3>
            <div className='list'>
                <button type='button' onClick={() => {setMessage(''); setEditMode(true);}}>edit profile</button> <br />
                <button type='button' onClick={() => {setMessage(''); setEditPassword(true);}}>edit password</button> <br />
                <button type='button' onClick={() => {navigate('/subscribe/')}}>subscribe</button> <br />
                <button type='button' onClick={() => {navigate('/class/')}}>search classes</button> <br />
                <button type='button' onClick={() => {navigate('/enrolled/')}}>past/future classes</button> <br />
                <button type='button' onClick={() => {navigate('/payment/')}}>payment history and upcoming payment</button> <br />
            </div>

            {props.is_admin ? 
            <>
            <p>(Admin)</p>
            <button type='button' onClick={() => {navigate('/studio/')}}>modify studios</button>
            <button type='button' onClick={() => {navigate('/studio_edit/', {state: {add: true}})}}>add studio</button> <br />
            <button type='button' onClick={() => {navigate('/plan/')}}>new subscription plan</button> 
            <button type='button' onClick={() => {navigate('/subscribe/', {state: {delete: true}})}}>delete subscription</button> <br />
            <button type='button' onClick={() => {navigate('/make_class/')}}>edit class</button>
            </> 
            : <></>}
            <br />
        </div>
        </>
    );
}

export default User;