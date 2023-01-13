import { useEffect, useState } from 'react';
import './style.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = (props) => {
    
    const post_url = props.base_url + 'accounts/api/token/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const location = useLocation();
    useEffect(() => {
        if (location.state){
            if (location.state.error){
                setError(location.state.error);
            }
        }
    }, [])

    const emailChangeHandle = (e) => setEmail(e.target.value);
    const passwordChangeHandle = (e) => setPassword(e.target.value);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"email": e.target.email.value, "password": e.target.password.value}),
        };
        fetch(post_url, requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    setError(data.detail);
                    props.authentication(false);
                }else {
                    setError("");
                    localStorage.setItem("access", data.access);
                    localStorage.setItem("refresh", data.refresh);
                    //console.log(localStorage.getItem("access"));
                    props.authentication(true);
                    //TODO user pageに遷移する
                    navigate('/user/');
                }
            })
            .catch((err) => {
                console.log(err.detail);
                setError(err.toString());
            })
    }

    return (
        <>
        <div className='container'>
            <div id='login'>
                <h1>Log in</h1>
                <hr/>
                <form id='login' action={post_url} method='POST' onSubmit={handleSubmit}>
                    <div className='textinput'>
                        <label htmlFor='email'> Email &emsp;  </label>
                        <input id="email" name='email' type="email" value={email} onChange={emailChangeHandle} required placeholder='info@example.com'></input> <br />

                        <label htmlFor='password'> Password &emsp;</label>
                        <input id="password" name='password' type='password' value={password} onChange={passwordChangeHandle} required></input>
                    </div>
                    <p className='notification'>{error}</p>
                    <button id='login' type='submit'>Login</button>
                </form>
            </div>
        </div>
        </>
    );
}

export default Login;