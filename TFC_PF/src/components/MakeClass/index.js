import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const MakeClass = (props) => {
    const navigate = useNavigate();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [error, setError] = useState({});
    const [class_instance, setClassInstance] = useState(false);
    
    const [class_program, setClassProgarm] = useState({});
    const [pr_delete, setPrDelete] = useState({});
    const [add, setAdd] = useState(false);
    const [new_class, setNewClass] = useState({start_year: '2022', end_year: '2022'});
    let start_date = '';
    let start_time = '';
    let end_date = '';
    let end_time = '';
    let res_ok = false;

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
                    props.authentication(false);
                    props.admin(false)
                }else if (!data.is_staff){
                    props.authentication(true);
                }else {
                    props.authentication(true);
                    props.admin(true);
                }
            })
        fetch(props.base_url + 'classes/edit/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                setClassProgarm((class_program) => ({...data}));
            })
    }, [])

    // handle change --------------------------------------------------------
    const handleAddProgram = (e) => {
        if (new_class.start_year && new_class.start_month && new_class.start_day && new_class.start_hour && new_class.start_min){
            start_date = new_class.start_year + '-' + new_class.start_month + '-' + new_class.start_day;
            start_time = new_class.start_hour + ':' + new_class.start_min + ':00';
        }else {
            start_date = '';
            start_time = '';
        }
        if (new_class.end_year && new_class.end_month && new_class.end_day){
            end_date = new_class.end_year + '-' + new_class.end_month + '-' + new_class.end_day;
        }else {
            end_date = '';
        }
        if(new_class.end_hour && new_class.end_min){
            end_time = new_class.end_hour + ':' + new_class.end_min + ':00';
        }else {
            end_time = '';
        }
        if (!new_class.studio || !new_class.name || !new_class.description || !new_class.coach || !new_class.capacity || !start_date || !start_time || !end_time){
            setError({msg: 'please provide all information except for end date and keywords'});
        }else {
            const data = end_date ? {studio: new_class.studio, name: new_class.name, description: new_class.description, coach: new_class.coach, capacity: new_class.capacity, startDate: start_date, startTime: start_time, endDate: end_date, endTime: end_time, keywords: new_class.keywords}
                                  : {studio: new_class.studio, name: new_class.name, description: new_class.description, coach: new_class.coach, capacity: new_class.capacity, startDate: start_date, startTime: start_time, endTime: end_time, keywords: new_class.keywords}
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }
            fetch(props.base_url + 'classes/edit/', requestOptions)
                .then((res) => {
                    res_ok = res.ok;
                    return res.json()
                })
                .then((data) => {
                    if (res_ok){
                        navigate('/user/', {state: {msg: 'class added successfully'}})
                    }else {
                        setError(data);
                    }
                })
                .catch((err) => {console.log(err)})
        }
    }

    const handleDelete = (e) => {
        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...pr_delete}),
        }
        fetch(props.base_url + 'classes/delete/', requestOptions)
            .then((res) => {
                if (res.ok){
                    navigate('/user/', {state: {msg: 'class deleted successfully'}});
                }else {
                    setPrDelete({});
                    setError({msg: "class delete failed"});
                }
            })
            .catch((err) => {console.log(err)})
    }

    //-----------------------------------------------------------------------
    if (Object.keys(pr_delete).length !== 0){
        return (
            <>
            <p>Are you sure to delete?</p>
            <div className='class_program'>
                <p>studio: {pr_delete.studio}</p>
                <p>name: {pr_delete.name}</p>
                <p>description: {pr_delete.description}</p>
            </div>
            <button type='button' onClick={handleDelete}>confirm</button> <br />
            <button type='button' onClick={() => {setPrDelete({})}}>back</button>
            </>
        )
    }

    if (add){
        //studio, name, description, coach, keywords, capacity, startDate, startTime, endTime, endDate
        return (
            <>
            <p className='notification'>
                <ul>
                    {Object.keys(error).map(key => (
                        <li>{error[key]}</li>
                    ))}
                </ul>
            </p>
            <label htmlFor='studio'>studio</label>
            <input id='studio' type='text' onChange={(e) => {setNewClass((new_class) => ({...new_class, studio: e.target.value}))}} value={new_class.studio}/> <br />
            <label htmlFor='name'>name</label>
            <input id='name' type='text' onChange={(e) => {setNewClass((new_class) => ({...new_class, name: e.target.value}))}} value={new_class.name}/> <br />
            <label htmlFor='description'>description</label>
            <input id='description' type='text' onChange={(e) => {setNewClass((new_class) => ({...new_class, description: e.target.value}))}} value={new_class.description}/> <br />
            <label htmlFor='coach'>coach</label>
            <input id='coach' type='text' onChange={(e) => {setNewClass((new_class) => ({...new_class, coach: e.target.value}))}} value={new_class.coach}/> <br />
            <label htmlFor='keywords'>keywords</label>
            <input id='keywords' type='text' onChange={(e) => {setNewClass((new_class) => ({...new_class, keywords: e.target.value}))}} value={new_class.keywords}/> <br />
            <label htmlFor='capacity'>capacity</label>
            <input id='capacity' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, capacity: Number(e.target.value)}))}} value={new_class.capacity}/> <br />
            start date: 
            <label htmlFor='start_year'>year(20XX) </label>
            <input id='start_year' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, start_year: e.target.value.toString()}))}} style={{width: '3rem'}} value={new_class.start_year}></input>
            <label htmlFor='start_month'>month(XX) </label>
            <input id='start_month' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, start_month: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.start_month}></input>
            <label htmlFor='start_day'>day(XX) </label>
            <input id='start_day' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, start_day: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.start_day}></input> <br />
            start time:
            <label htmlFor='start_hour'>hour(XX) </label>
            <input id='start_hour' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, start_hour: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.start_hour}></input>
            <label htmlFor='start_min'>min(XX) </label>
            <input id='start_min' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, start_min: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.start_min}></input> <br />
            end date (if not specified, it will be 10 weeks later):
            <label htmlFor='end_year'>year(20XX) </label>
            <input id='end_year' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, end_year: e.target.value.toString()}))}} style={{width: '3rem'}} value={new_class.end_year}></input>
            <label htmlFor='end_month'>month(XX)</label>
            <input id='end_month' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, end_month: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.end_month}></input>
            <label htmlFor='end_day'>day(XX) </label>
            <input id='end_day' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, end_day: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.end_day}></input> <br />
            end time: 
            <label htmlFor='end_hour'>hour(XX) </label>
            <input id='end_hour' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, end_hour: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.end_hour}></input>
            <label htmlFor='end_min'>min(XX) </label>
            <input id='end_min' type='number' onChange={(e) => {setNewClass((new_class) => ({...new_class, end_min: ('00' + e.target.value).slice(-2)}))}} style={{width: '2rem'}} value={new_class.end_min}></input> <br />
            
            <button type='submit' onClick={handleAddProgram}>add</button>
            </>
        )
    }

    if (class_instance){
        return (
            <>
            <p className='notification'>
                <ul>
                    {Object.keys(error).map(key => (
                        <li>{error[key]}</li>
                    ))}
                </ul>
            </p>
            <h2>Class instances</h2>
            <p>Use django admin panel!&ensp;
            <a href={props.base_url + 'admin/'}>admin panel</a> </p> <br />
            <button type='button' onClick={() => {setClassInstance(false)}}>edit class programs</button>
            </>
        )
    }

    return (
        <>
        <p className='notification'>
            <ul>
                {Object.keys(error).map(key => (
                    <li>{error[key]}</li>
                ))}
            </ul>
        </p>
        <h2>Class Programs</h2>
        <button type='button' onClick={() => {setClassInstance(true)}}>edit class instances</button>
        {Object.keys(class_program).map((key) => (
            <>
            <div className='class_program'>
                <p>studio: {class_program[key].studio}</p>
                <p>name: {class_program[key].name}</p>
                <p>description: {class_program[key].description}</p>
                <p>{days[(new Date(class_program[key].startDate.replace(/-/g,"/")).getDay())]}</p>
                <p>{class_program[key].startTime} ~ {class_program[key].endTime}</p>
                <button type='button' onClick={() => {setPrDelete(class_program[key])}}>delete</button>
            </div>
            </>
        ))}

        <div className='button'>
            <button type='button' id='add' onClick={() => {setAdd(true)}}>add class</button>
        </div>
        </>
    )
}

export default MakeClass;