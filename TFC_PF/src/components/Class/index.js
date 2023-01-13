import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';

const Class = (props) => {
    const navigate = useNavigate();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [error, setError] = useState('');
    const [params, setParams] = useState({studio: '', name: '', coach: '', start_year: (new Date()).getFullYear() + '', start_month: (new Date()).getMonth() + 1 + '', start_day: (new Date()).getDate() + '', start_hour: (new Date()).getHours() + '', start_min: (new Date()).getMinutes() + '', end_year: (new Date()).getFullYear() + '', end_month: '', end_day: '', end_hour: '', end_min: '', page: 1})
    const [next, setNext] = useState(null);
    const [enroll, setEnroll] = useState({});
    const [class_info, setClassInfo] = useState({});
    const [show_program, setShowProgram] = useState(false);
    const [class_program, setClassProgram] = useState({});
    const [enroll_program, setEnrollProgram] = useState({});
    const [show_cancelled, setShowCancelled] = useState(true);
    let start_time = '';
    let end_time = '';

    const [classes, setClasses] = useState([]);
    const [studio_ids, setStudioIds] = useState([]);

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
            .catch((err) => {console.log(err)})

        const req = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        fetch(props.base_url + 'classes/edit/', req)
            .then((res) => res.json())
            .then((data) => {
                setClassProgram((class_program) => ({...data}));
            })
            .catch((err) => {console.log(err)})
    }, [])

    useEffect(() => {
        setError('');
        const requestOptions = {
            method: 'GET',

        };
        if (params.start_year && params.start_month && params.start_day && params.start_hour && params.start_min){
            start_time = params.start_year + '-' + params.start_month + '-' + params.start_day + ' ' + params.start_hour + ':' + params.start_min + ':00';
        }else {
            start_time = '';
        }
        if (params.end_year && params.end_month && params.end_day && params.end_hour && params.end_min){
            end_time = params.end_year + '-' + params.end_month + '-' + params.end_day + ' ' + params.end_hour + ':' + params.end_min + ':00';
        }else {
            end_time = '';
        }
        fetch(props.base_url + `classes/list/?page=${params.page}&studio=${params.studio}&name=${params.name}&coach=${params.coach}&startTime=${start_time}&endTime=${end_time}`, requestOptions)
            .then((res) => res.json())
            .then((data) => {
                setNext(data.next);
                setClasses([...data.results]);
                setStudioIds([]);
                for (let i=0; i<data.results.length; i++){
                    fetch(props.base_url + 'studios/studio/?name=' + data.results[i].studio)
                        .then((res) => res.json())
                        .then((data) => {
                            setStudioIds((studio_ids) => [...studio_ids, data.results[0].id]);
                        })
                        .catch((err) => {setError(err.toString())})
                }
                for (let i=0; i<data.results.length; i++){
                    fetch(props.base_url + 'classes/edit/?name=' + data.results[i].name)
                        .then((res) => res.json())
                        .then((info) => {
                            if (info[0]){
                                setClassInfo((class_info) => ({...class_info, [data.results[i].name]: {...info[0]}}))
                            }
                        })
                        .catch((err) => {setError(err.toString())})
                }
            })
        setEnroll({});
    }, [params])

    const handleStudioChange = (e) => { setParams({...params, studio: e.target.value}) };
    const handleNameChange = (e) => { setParams({...params, name: e.target.value}) };
    const handleCoachChange = (e) => { setParams({...params, coach: e.target.value}) };
    const handleStartYearChange = (e) => { setParams({...params, start_year: e.target.value}) };
    const handleStartMonthChange = (e) => { setParams({...params, start_month: e.target.value}) };
    const handleStartDayChange = (e) => { setParams({...params, start_day: e.target.value}) };
    const handleStartHourChange = (e) => { setParams({...params, start_hour: e.target.value}) };
    const handleStartMinChange = (e) => { setParams({...params, start_min: e.target.value}) };
    const handleEndYearChange = (e) => { setParams({...params, end_year: e.target.value}) };
    const handleEndMonthChange = (e) => { setParams({...params, end_month: e.target.value}) };
    const handleEndDayChange = (e) => { setParams({...params, end_day: e.target.value}) };
    const handleEndHourChange = (e) => { setParams({...params, end_hour: e.target.value}) };
    const handleEndMinChange = (e) => { setParams({...params, end_min: e.target.value}) };

    //-------------------------------------------------------------------------------
    const handleEnroll = (e) => {
        const req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'to_class': enroll.id})
        }
        fetch(props.base_url + 'classes/enroll/', req)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    setError(data.detail);
                    setEnroll({});
                }else{
                    navigate('/user/', {state: {msg: 'Thank you for enrolling!'}});
                }
            })
    }

    const handleEnrollProgram = (e) => {
        const req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'class_name': enroll_program.name})
        }
        fetch(props.base_url + 'classes/enroll/', req)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    setError(data.detail);
                    setEnrollProgram({});
                }else{
                    navigate('/user/', {state: {msg: 'Thank you for enrolling!'}});
                }
            })
            .catch((err) => {console.log(err)})
    }

    // return ----------------------------------------------------------------------------

    if (Object.keys(enroll_program).length !== 0){
        return (
            <>
            <div className='enroll_conf'>
                <p>Are you sure to enroll?</p>
                <p>After clicking "enroll", you'll be enrolled to all the future occurrences for this class</p>

                <div className='enroll_info'>
                    <p>studio: {enroll_program.studio}</p>
                    <p>name: {enroll_program.name}</p>
                    <p>description: {enroll_program.description}</p>
                    <p>{days[(new Date(enroll_program.startDate.replace(/-/g,"/")).getDay())]}</p>
                    <p>{enroll_program.startTime} ~ {enroll_program.endTime}</p>
                    <p>From: {enroll_program.startDate}</p>
                    <p>To: {enroll_program.endDate}</p>
                </div>

                <button id='enroll' type='button' onClick={handleEnrollProgram}>enroll</button> <br />
                <button type='button' onClick={() => {setEnrollProgram({});}}>back</button>
            </div>
            </>
        )
    }

    if (show_program){
        return (
            <>
            <div className='container'>
                <h2>class programs</h2>
                <button className='show' type='button' onClick={() => {setShowProgram(false)}}>show class instances</button>
            </div>
            <hr/>
            {Object.keys(class_program).map((key) => (
                <>
                <div className='program'>
                    <p>studio: {class_program[key].studio}</p>
                    <p>class name: {class_program[key].name}</p>
                    <p>description: {class_program[key].description}</p> <hr/>
                    <p style={{'color': 'green', 'fontWeight': 'bold'}}>Every {days[(new Date(class_program[key].startDate.replace(/-/g,"/")).getDay())]}day</p>
                    <p>{class_program[key].startTime} ~ {class_program[key].endTime}</p>
                    <p>From: {class_program[key].startDate}</p>
                    <p>To: {class_program[key].endDate}</p>
                    {props.is_authenticated ? <button id='enroll' type='button' onClick={() => setEnrollProgram({...class_program[key], key: key})}>enroll</button> : <></>}
                </div>
                </>
            ))}
            </>
        )
    }

    if (Object.keys(enroll).length !== 0){
        return (
            <>
            <div className='enroll_conf'>
                <p>Are you sure to enroll?</p>

                <div className='enroll_info'>
                    <p>name of class: {enroll.name}</p>
                    <Link to={'/studio/' + studio_ids[enroll.key]}>studio: {enroll.studio}</Link> <br />
                    <p>time: {enroll.startTime} ~ {enroll.endTime}</p>
                </div>

                <button id='enroll' type='button' onClick={handleEnroll}>enroll</button> <br />
                <button type='button' onClick={() => {setEnroll({});}}>back</button>
            </div>
            </>
        )
    }

    return (
        <>
            {error ? <p className='notification'>{error}</p> : <></>}
        <div className='container'>
            <h2>class instances</h2>
            <button className='show' type='button' onClick={() => {setShowProgram(true)}}>show class programs</button>
            <hr/>

            <div className='search'>
                <label htmlFor='studio'>studio: &emsp;
                    <input id='studio' type='text' onChange={handleStudioChange} value={params.studio}></input> <br />
                </label>
                <label htmlFor='class'>class name: &emsp;
                    <input id='class' type='text' onChange={handleNameChange} value={params.class}></input> <br />
                </label>
                <label htmlFor='coach'>coach: &emsp;
                    <input id='coach' type='text' onChange={handleCoachChange} value={params.coach}></input> <br />
                </label>
                <div className='start'>
                start after: &emsp;
                <label htmlFor='start_year'>year
                    <input id='start_year' type='text' onChange={handleStartYearChange} size='4' value={params.start_year}></input>
                </label>
                <label htmlFor='start_month'>month
                    <input id='start_month' type='text' onChange={handleStartMonthChange} size='2' value={params.start_month}></input>
                </label>
                <label htmlFor='start_day'>day
                    <input id='start_day' type='text' onChange={handleStartDayChange} size='2' value={params.start_day}></input>
                </label>
                <label htmlFor='start_hour'>hour
                    <input id='start_hour' type='text' onChange={handleStartHourChange} size='2' value={params.start_hour}></input>
                </label>
                <label htmlFor='start_min'>min
                    <input id='start_min' type='text' onChange={handleStartMinChange} size='2' value={params.start_min}></input> <br />
                </label>
                </div>
                <div className='end'>
                    end before: &emsp;
                    <label htmlFor='end_year'>year
                        <input id='end_year' type='text' onChange={handleEndYearChange} size='4' value={params.end_year}></input>
                    </label>
                    <label htmlFor='end_month'>month
                        <input id='end_month' type='text' onChange={handleEndMonthChange} size='2' value={params.end_month}></input>
                    </label>
                    <label htmlFor='end_day'>day
                        <input id='end_day' type='text' onChange={handleEndDayChange} size='2' value={params.end_day}></input>
                    </label>
                    <label htmlFor='end_hour'>hour
                        <input id='end_hour' type='text' onChange={handleEndHourChange} size='2' value={params.end_hour}></input>
                    </label>
                    <label htmlFor='end_min'>min
                        <input id='end_min' type='text' onChange={handleEndMinChange} size='2' value={params.end_min}></input> <br />
                    </label>
                </div>
            </div>
            <br />
            <label style={{'backgroundColor': 'white'}} htmlFor='cancelled'>include cancelled classes
                <input id='cancelled' type={'checkbox'} checked={show_cancelled} onChange={(e) => {setShowCancelled(!show_cancelled)}}></input>
            </label> <br/>
        </div>

        {Object.keys(classes).map((key) => (
            <>
            {!classes[key].cancelled || show_cancelled ? 
            <div className='class'>
                {classes[key].cancelled ? <p className='notification'>cancelled</p> : <></>}
                <p>name of class: {classes[key].name}</p>
                <p>description: {class_info[classes[key].name] ? class_info[classes[key].name].description : <></>}</p>
                <p>coach: {class_info[classes[key].name] ? class_info[classes[key].name].coach : <></>}</p>
                <p>studio: <Link to={'/studio/' + studio_ids[key]}>{classes[key].studio}</Link> <br /></p> 
                <p>time: {classes[key].startTime} ~ {classes[key].endTime}</p> <hr/>
                {new Date(classes[key].startTime) < new Date() ? <><p style={{color: 'red'}}>finished</p><hr/></> : <></>}
                {!classes[key].cancelled && props.is_authenticated && new Date(classes[key].startTime) >= new Date() ? <button id='enroll' type='button' onClick={() => setEnroll({...classes[key], key: key})}>enroll</button> : <></>}
            </div> : <></>}
            </>
        ))}

        <div className='button'>
            <button type='button' onClick={() => setParams({...params, page: Math.max(1, params.page-1)})}>prev</button> &emsp;
            page{params.page} &emsp;
            <button type='button' onClick={() => {if (next){ setParams({...params, page: params.page+1 });}}}>next</button>
        </div>
        </>
    )
}

export default Class;