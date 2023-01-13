import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './style.css';

const Enrolled = (props) => {
    const location = useLocation();

    const navigate = useNavigate();
    const [enrolled, setEnrolled] = useState({});
    const [error, setError] = useState('');
    const [class_info, setClassInfo] = useState([]);
    const [drop_conf, setDropConf] = useState({});
    const [future, setFuture] = useState(true);
    const [name, setName] = useState('');

    useEffect(() => {
        if (location.state){
            if (location.state.msg){
                setError(location.state.msg);
            }else {
                setError('');
            }
        }else {
            setError('');
        }

        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
            },
        };
        fetch(props.base_url + 'classes/enroll/check/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    navigate('/login/', {state: {error: 'please log in'}});
                }else {
                    setClassInfo((class_info)=> []);
                    setEnrolled(() => (data));
                }
            })
            .catch((err) => {console.log(err)})
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

    useEffect(() => {
        Object.keys(enrolled).map((key) => {
            fetch(props.base_url + 'classes/list/?id=' + enrolled[key].to_class)
                .then((res) => res.json())
                .then((data) => {
                    setClassInfo((class_info) => [...class_info, {...data.results[0]}])
                })
        })
    }, [enrolled])

    const handleChangeName = (e) => {
        setName(e.target.value);
    }

    const handleDrop = (e) => {
        if (drop_conf.all){
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({class_name: drop_conf.name})
            };
            fetch(props.base_url + 'classes/enroll/delete/', requestOptions)
                .then((res) => {
                    if (res.ok){
                        setDropConf({});
                        navigate('/user/', {state: {msg: "you've successfully dropped"}});
                    }else {
                        setError('failed to drop. try again');
                        setDropConf({});
                    }
                })
                .catch((err) => {console.log(err)})
        }else {
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({to_class: drop_conf.id})
            };
            fetch(props.base_url + 'classes/enroll/delete/', requestOptions)
                .then((res) => {
                    if (res.ok){
                        setDropConf({});
                        navigate('/user/', {state: {msg: "you've successfully dropped"}});
                    }else {
                        setError('failed to drop. try again');
                        setDropConf({});
                    }
                })
                .catch((err) => {console.log(err)})
        }
    }

    if (Object.keys(drop_conf).length !== 0){
        return (
            <>
            <p style={{'backgroundColor': "white", 'fontWeight': 'bold'}}>Are you sure to drop this class?</p>
            {drop_conf.all ? <p style={{'backgroundColor': 'white'}}>By clicking "drop" you will drop from all instances of this program</p> : <></>}
            <div style={{'height': '14rem'}} className='class'>
                {drop_conf.all ? <></> : <p>id: {drop_conf.id}</p>}
                <p>name of class: {drop_conf.name}</p>
                <p>{drop_conf ? drop_conf.description : <></>}</p>
                <p>coach: {drop_conf ? drop_conf.coach : <></>}</p>
                <p>studio:{drop_conf.studio}</p>
                {drop_conf.all ? <></> : <p>time: {drop_conf.startTime} ~ {drop_conf.endTime}</p>}
                <button id='drop' type='button' onClick={handleDrop}>drop</button> <br />
                <button type='button' onClick={() => {setDropConf({})}}>back</button>
            </div>
            </>
        )
    }

    let fin = [];
    return (
        <>
        <p className='notification'>{error}</p>

        <br />
        {future ? <button className='toggle' type='button' onClick={() => {setFuture(false); setName('');}}>check past classes</button> : <button className='toggle' type='button' onClick={() => {setFuture(true)}}>show only future classes</button>}
        <br />
        <label htmlFor='name'>class name: </label>
        <input type='text' id='name' value={name} onChange={handleChangeName}></input> <br />
        {Object.keys(class_info).map((key) => {
            if (fin.indexOf(class_info[key].id) !== -1){
                return (<></>)
            }
            fin.push(class_info[key].id);
            return (
            <>
            {future && new Date(class_info[key].startTime) >= new Date() && class_info[key].name.indexOf(name) >= 0 ? 
            <div style={{'height': '15rem'}} className='class'>
                <p>id: {class_info[key].id}</p>
                <p>name of class: {class_info[key].name}</p>
                <p>{class_info[key] ? class_info[key].description : <></>}</p>
                <p>coach: {class_info[key] ? class_info[key].coach : <></>}</p>
                <p>studio:{class_info[key].studio}</p> <hr style={{'height': '1px', 'background-color': 'red'}}/>
                <p style={{'paddingBottom': '1rem'}}>time: {class_info[key].startTime} ~ {class_info[key].endTime}</p> <hr style={{'height': '1px', 'background-color': 'red'}}/>
                <button id='drop' style={{'margin': '0.5rem'}} type='button' onClick={(e) => { setDropConf(class_info[key]); }}>drop</button> <br />
                <button type='button' onClick={(e) => { setDropConf({...class_info[key], all: true}); }}>drop all instances from this program</button>
            </div> : <></>}
            {!future && new Date(class_info[key].startTime) < new Date() && class_info[key].name.indexOf(name) >= 0 ? 
            <div style={{'height': '15rem'}} className='class'>
                <p>id: {class_info[key].id}</p>
                <p>name of class: {class_info[key].name}</p>
                <p>{class_info[key] ? class_info[key].description : <></>}</p>
                <p>coach: {class_info[key] ? class_info[key].coach : <></>}</p>
                <p>studio:{class_info[key].studio}</p> <hr style={{'height': '1px', 'background-color': 'red'}}/>
                <p style={{'paddingBottom': '1rem'}}>time: {class_info[key].startTime} ~ {class_info[key].endTime}</p> <hr style={{'height': '1px', 'background-color': 'red'}}/>
                {new Date(class_info[key].startTime) < new Date() ? <><p style={{color: 'red'}}>finished</p></> : <></>}
            </div> : <></>}
            </>)
        })}

        <Link to={'/user/'}>back</Link>
        </>
    )
}

export default Enrolled;