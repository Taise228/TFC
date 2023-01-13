import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './style.css';

const Plan = (props) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [confirmation, setConfirmation] = useState(false);

    const duration_options = [{value: 'month', label: 'month'}, {value: 'year', label: 'year'}];

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
        }
        fetch(props.base_url + 'accounts/profile/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    navigate('/login/', {state: {error: 'please log in'}});
                }else if (!data.is_staff){
                    props.authentication(true);
                    navigate('/user/', {state: {msg: 'this operation is allowed for only admin users'}});
                }else {
                    props.authentication(true);
                    props.admin(true);
                }
            })
    }, [])

    const handleSubmit = (e) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({price: price, duration: duration}),
        }
        fetch(props.base_url + 'subscription/subscription/', requestOptions)
            .then((res) => {
                if (res.ok){
                    return res.json();
                }else{
                    navigate('/user/', {state: {msg: 'failed'}})
                }
            })
            .then((data) => {
                if (data.detail){
                    setError(data.detail);
                    setConfirmation(false);
                }else {
                    navigate('/user/', {state: {msg: 'subscription plan sdded successfully'}});
                }
            })
            .catch((err) => {console.log(err)})
    }

    if (confirmation){
        return (
            <>
            <p>Confirmation</p>
            <p>Price: {price}</p>
            <p>Duration: {duration}</p>
            <button type='submit' onClick={handleSubmit}>confirm</button> <br />
            </>
        )
    }

    return (
        <>
        <p className='notification'>{error}</p>
        <label htmlFor='price'>price</label>
        <input type={'text'} id='price' value={price} onChange={(e) => {setPrice(e.target.value)}} /> <br />
        <Select options={duration_options} onChange={(e) => {setDuration(e.value)}}></Select>

        <button type='button' onClick={() => {setConfirmation(true)}}>add plan</button> <br />
        <button type='button' onClick={() => {navigate('/user/')}}>back</button>
        </>
    )
}

export default Plan;