import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';

const Subscribe = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [error, setError] = useState('');
    const [message, setMessage] = useState({});

    const [subscription, setSubscription] = useState({});
    const [plan, setPlan] = useState({});
    const [card, setCard] = useState('');
    const [expiry_date, setExpiryDate] = useState('');
    const [csv, setCsv] = useState('');
    const [checked, setChecked] = useState('');
    const [all_plans, setAllPlans] = useState({});

    const [no_plan, setNoPlan] = useState(true);
    const [change_plan, setChangePlan] = useState(false);
    const [confirmation, setConfirmation] = useState(false);
    const [del, setDel] = useState(false);
    const [del_plan, setDelPlan] = useState(false);
    const [del_conf, setDelConf] = useState({});

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('access')},
        }
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
        fetch(props.base_url + 'subscription/plan/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                //console.log(data); data.code === "token_not_valid" or data.detail === "Not found."
                if (data.code === "token_not_valid"){
                    navigate('/login/', {state: {error: 'please log in'}})
                }else if (data.detail){
                    setNoPlan(true);
                }else {
                    setNoPlan(false);
                    setSubscription({...data});   //id, user, plan(id), card, expiry_date, csv
                    setCard(data.card);
                    setExpiryDate(data.expiry_date);
                    setCsv(data.csv);
                    const req = {
                        method: 'GET',
                        headers: {'Authorization': 'Bearer ' + localStorage.getItem('access')},
                    }
                    fetch(props.base_url + 'subscription/subscription/' + data.plan + '/', req)
                        .then((res) => res.json())
                        .then((myplan) => {
                            //console.log(myplan);   //id, duration, price
                            setPlan({...myplan});
                        })
                        .catch((err) => {setError(err.toString());})
                }
            })
            .catch((err) => {
                setError(err.toString());
            })
        //fetch all plans
        fetch(props.base_url + 'subscription/subscription/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                setAllPlans({...data});
            })
            .catch((err) => setError(err.toString()))
        
        setMessage({});
        if (location.state){
            if (location.state.delete){
                setDelPlan(true);
            }
        }
    }, [])

    const handleSubmit = (e) => {
        if (checked==='' || card==='' || expiry_date==='' || csv===''){
            setChangePlan(true);
            setError("Input all");
        }else {
            setChangePlan(false);
            setConfirmation(true);
        }
    }

    const handleFinalSubmit = (e) => {
        const to_url = no_plan ? props.base_url + 'subscription/create/' : props.base_url + 'subscription/plan/'
        const submitOptions = {
            method: no_plan ? 'POST' : 'PATCH',
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('access')},
            body: JSON.stringify({"card": card, "expiry_date": expiry_date, "csv": csv, "plan": checked}),
        }
        fetch(to_url, submitOptions)
            .then((res) => {
                if (!res.ok){
                    //setConfirmation(false);
                    //setChangePlan(true);
                    //setError("Please retry again");
                    return res.json();
                }else {
                    const data = res.json();
                    setConfirmation(false);
                    navigate('/user/', {state: {msg: "Thank you for subscribing"}});
                    return res.json();
                }
            })
            .then((data) => { 
                setError("Please retry again");
                setConfirmation(false);
                setChangePlan(true);
                console.log(data);
                setMessage({...data}); 
            })
            .catch((err) => setError(err.toString()))
    }

    const handleDelete = (e) => {
        const delOptions = {
            method: 'DELETE',
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('access'),},
        }
        fetch(props.base_url + 'subscription/plan/', delOptions)
            .then((res) => {
                if (res.ok){
                    setConfirmation(false);
                    setDel(false);
                    navigate('/user/', {state: {msg: "Unsubscribed"}});
                }else {
                    setConfirmation(false);
                    setChangePlan(true);
                    setError("Please retry again");
                }
            })
            .catch((err) => {
                setError(err.toString());
                setDel(false);
                setConfirmation(false);
            })
    }

    const handleDelPlan = (e) => {
        const requestOptions = {
            method: 'DELETE',
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('access'),},
        }
        fetch(props.base_url + 'subscription/subscription/' + del_conf.id + '/', requestOptions)
            .then((res) => {
                console.log(res);
                if (res.ok){
                    navigate('/user/', {state: {msg: 'plan deleted successfully'}});
                }else {
                    setError('failed');
                    setDelConf({});
                }
            })
            .catch((err) => {console.log(err)})
    }

    //------------------------------------------------------------------------------
    if (confirmation){
        if (del){
            return (
                <>
                <p>Are you sure to unsubscribe?</p> <br />

                <button type='submit' onClick={handleDelete}>Unsubscribe</button> <br />
                <button type='button' onClick={() => {setDel(false); setConfirmation(false)}}>back</button>
                </>
            )
        }

        let pr = '';
        let dur = '';
        for (let i=0; i<Object.keys(all_plans).length; i++){
            if (all_plans[i].id.toString() === checked.toString()){
                pr = all_plans[i].price;
                dur = all_plans[i].duration;
            }
        }
        return (
            <>
                <p> Are you sure to submit?</p>
                <p> After clicking submit, the fee will be immediately billed</p>

                <div className='plan'>
                    <table>
                        <thead>
                        <tr>
                            <th>Plan number</th>
                            <th>Price</th>
                            <th>Duration</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Plan{checked}</td>
                            <td>{pr}</td>
                            <td>{dur}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <ul>
                    <li>card: {card}</li>
                    <li>expiry_date: {expiry_date}</li>
                </ul>

                <button id='plan_conf' type='button' onClick={handleFinalSubmit}>submit</button> <br />
                <button type='button' onClick={() => {setConfirmation(false); setChangePlan(true);}}>back</button>
            </>
        )
    }

    if (change_plan){
            return (
                <>
                    <h2 style={{'marginBottom': '0rem'}}>Change subscription plan</h2>
                    {Object.keys(message).map((key) => {
                        return (
                            <p className='message'>{key + ': ' + message[key][0]}</p>
                        )
                    })}
                    <p style={{'fontSize': 'large', 'fontWeight': 'bold'}}>Select from below</p>

                    {Object.keys(all_plans).map((key) => {
                        if (!no_plan && all_plans[key].id === plan.id){
                            return (
                                <>
                                    <div className='plan'>
                                        <span style={{'backgroundColor': 'aqua'}}>This is your current plan</span> <br />
                                        <input type='radio' id='plan' name='plan' value={all_plans[key].id} onChange={(e) => setChecked(e.target.value)} checked={checked.toString()===all_plans[key].id.toString()} />
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Plan number</th>
                                                <th>Price</th>
                                                <th>Duration</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>Plan{all_plans[key].id}</td>
                                                <td>{all_plans[key].price}</td>
                                                <td>{all_plans[key].duration}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )
                        }else {
                            return (
                                <>
                                    <div className='plan'>
                                        <input type='radio' id='plan' name='plan' value={all_plans[key].id} onChange={(e) => setChecked(e.target.value)} checked={checked.toString()===all_plans[key].id.toString()} />
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Plan number</th>
                                                <th>Price</th>
                                                <th>Duration</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>Plan{all_plans[key].id}</td>
                                                <td>{all_plans[key].price}</td>
                                                <td>{all_plans[key].duration}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )
                        }
                    })}

                    <div className='plan_out'>
                        <div className='plan_in'>
                            <label htmlFor='card'>card</label>
                            <input type='text' id='card' name='card' value={card} onChange={(e) => setCard(e.target.value)}></input> <br />
                            <label htmlFor='expiry_date'>expiry_date</label>
                            <input type='text' id='expiry_date' name='expiry_date' value={expiry_date} onChange={(e) => setExpiryDate(e.target.value)}></input> <br />
                            <label htmlFor='csv'>csv</label>
                            <input type='text' id='csv' name='csv' value={csv} onChange={(e) => setCsv(e.target.value)}></input> <br />
                        </div>

                        <p className='notification'>{error}</p> <br />
                        {no_plan ? <></> : <><button type='button' onClick={() => {setChangePlan(false); setDel(true); setConfirmation(true);}}>Unsubscribe</button> <br /> </>}

                        <button id='change_plan' type='submit' onClick={handleSubmit}>submit</button> <br />

                        <button type='button' onClick={() => setChangePlan(false)}>back</button>
                    </div>
                </>
            )
    }

    if (no_plan){
        return (
            <>
                <p className='notification'>{error}</p> <br />
                <p className='message'>
                {Object.keys(message).map((key) => {
                    return (
                        <><p className='message'>{key + ': ' + message[key][0]}</p></>
                    )
                })}
            </p>
                
                <p>You don't have a plan yet!</p>

                <button type='button' onClick={() => setChangePlan(true)}>see plan</button>
            </>
        )
    }

    if (Object.keys(del_conf).length !== 0){
        return (
            <>
            <p className='notification'>Confirmation</p>
            <p>Plan {del_conf.id}</p>
            <p>Price: {del_conf.price}</p>
            <p>Duration: {del_conf.duration}</p>
            <button type='button' onClick={handleDelPlan}>delete</button>
            </>
        )
    }

    if (del_plan){
        return (
            <>
            <p className='notification'>{error}</p> <br />
            {Object.keys(all_plans).map((key) => {
                return (
                    <>
                    <div className='plan'>
                        <table>
                            <thead>
                            <tr>
                                <th>Plan number</th>
                                <th>Price</th>
                                <th>Duration</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Plan{all_plans[key].id}</td>
                                <td>{all_plans[key].price}</td>
                                <td>{all_plans[key].duration}</td>
                            </tr>
                            </tbody>
                        </table>
                        <button type='button' onClick={() => {setDelConf({...all_plans[key]});}}>delete</button>
                    </div></>
                )})}
                </>
        )
    }

    return (
        <>
            <h2 style={{'marginBottom': '0rem'}}>Subscription</h2>
            <p className='notification'>{error}</p>
            <p className='message'>
                {Object.keys(message).map((key) => {
                    return (
                        <></>
                    )
                })}
            </p>

            <span style={{'fontSize': 'large'}}>This is your plan</span>
            <div className='plan'>
                <table>
                    <thead>
                        <tr>
                            <th>Plan number</th>
                            <th>Price</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Plan{plan.id}</td>
                            <td>{plan.price}</td>
                            <td>{plan.duration}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button id='plan' type='button' onClick={() => setChangePlan(true)}>change/unsubscribe plan</button>
        </>
    )
}

export default Subscribe;