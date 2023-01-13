import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';

const Payment = (props) => {
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
            }
        }
        fetch(props.base_url + 'subscription/payment/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    navigate('/login/', {state: {error: 'please log in'}})
                }else {
                    setPayments([...data]);
                }
            })
            .catch((err) => {setError(err)})
            fetch(props.base_url + 'accounts/profile/', requestOptions)
                .then((res) => res.json())
                .then((data) => {
                    if (data.detail){
                        props.authentication(false);
                        props.admin(false)
                    }else if (!data.is_staff){
                        props.authentication(true);
                    }else {
                        props.authentication(true);
                        props.admin(true);
                    }
                })
    }, [])

    return (
        <>
        <p className='notification'>{error}</p>

        <table className='payment'>
            <thead>
                <tr>
                    <th></th>
                    <th>time</th>
                    <th>price</th>
                    <th>card</th>
                </tr>
            </thead>
            <tbody>
                {Object.keys(payments).map((key) => (
                    <tr>
                        <td>{key}</td>
                        <td>{payments[key].time}</td>
                        <td>{payments[key].price}</td>
                        <td>{'*********' + payments[key].card.substr(10)}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <Link to={'/user/'}>back</Link>
        </>
    )
}

export default Payment;