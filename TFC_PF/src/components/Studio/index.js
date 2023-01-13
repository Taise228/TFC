import { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import './style.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Geocode from "react-geocode";
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Studio = (props) => {
    //const navigate = useNavigate();
    const location = useLocation();
    const navigate = useNavigate();

    const [location_error, setLocationError] = useState('connot use current location');
    const [studios, setStudios] = useState({results: []});
    const [params, setParams] = useState({lat: 0, lng: 0, page: 1, name: '', amenity: '', class: ''});
    const [error, setError] = useState('');
    const [point, setPoint] = useState('');
    const [next, setNext] = useState(null);
    const [current_location, setCurrentLocation] = useState(0);

    const [marks, setMarks] = useState([]);
    const [default_center, setDefaultCenter] = useState({lat: 43.66, lng: -79.39,});

    const set_location = (point) => {
        Geocode.setApiKey(props.api_key)
        Geocode.fromAddress(point)
            .then((res) => {
                setParams({...params, lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng})
                setDefaultCenter({lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng})
            })
    }

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
                }else if (data.detail){
                    props.authentication(false);
                    props.admin(false)
                }else if (!data.is_staff){
                    props.authentication(true);
                }else {
                    props.authentication(true);
                    props.admin(true);
                }
            })
        navigator.geolocation.getCurrentPosition((position) => {
            setLocationError('');
            setParams({...params, lat: position.coords.latitude, lng: position.coords.longitude});
            setDefaultCenter({lat: position.coords.latitude, lng: position.coords.longitude})
        });
    }, [])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
        setLocationError('');
        setParams({...params, lat: position.coords.latitude, lng: position.coords.longitude});
        setPoint('');
        setDefaultCenter({lat: position.coords.latitude, lng: position.coords.longitude})
        });
    }, [current_location])

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
        }
        fetch(props.base_url + `studios/studio/?page=${params.page}&latitude=${params.lat}&longitude=${params.lng}&name=${params.name}&amenity=${params.amenity}&class=${params.class}`, requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.detail){
                    setError(data.detail);
                }else {
                    setNext(data.next);
                    setStudios({...data});
                    let mm = [];
                    for (let i=0; i<data.results.length; i++){
                        mm.push({'name': data.results[i].name, 'location': {'lat': data.results[i].latitude, 'lng': data.results[i].longitude}});
                    }
                    setMarks(mm);
                }
            })
    }, [params])

    const handleNameChange = (e) => { setParams({...params, name: e.target.value })};
    const handleAmenityChange = (e) => { setParams({...params, amenity: e.target.value })};
    const handleClassChange = (e) => { setParams({...params, class: e.target.value })};
    const handlePointChange = (e) => { setPoint(e.target.value); set_location(e.target.value); };

    // Google Maps -----------------------------------------------
    const map_styles = {
        height: '20rem',
        width: '20rem',
        margin: '0 auto',
    }

    return (
        <>
        <div className='container'>
        <h2>Search studios</h2>
        <hr />
        <p className='notification'>{location_error}</p>
        <p className='notification'>{error}</p> <br />

        <div className='search'>
            <label htmlFor='name'>Studio name: &emsp;
                <input type='text' id='name' value={params.name} onChange={handleNameChange}></input> <br />
            </label>
            <label htmlFor='amenity'>Amenity: &emsp;
                <input type='text' id='amenity' value={params.amenity} onChange={handleAmenityChange}></input> <br />
            </label>
            <label htmlFor='name'>Class: &emsp;
                <input type='text' id='class' value={params.class} onChange={handleClassChange}></input> <br />
            </label>
            <label htmlFor='postal_code'>Source address/postal code: &emsp;
                <input type='text' id='postal_code' value={point} onChange={handlePointChange}></input> <br />
            </label>
        </div>
        <button id='current' type='button' onClick={() => {setCurrentLocation(current_location + 1)}}>
            <img id='pin' src="https://thumb.ac-illust.com/92/927a9df380b62c4c3ef94e7ca782bb9b_t.jpeg" alt='pin' /> set current location
        </button>

        {window.google === undefined ? (
            <>
            <LoadScript googleMapsApiKey={props.api_key}>
                <GoogleMap mapContainerStyle={map_styles} zoom={12} center={default_center}>
                    <Marker key={'your current location'} position={{'lat': params.lat, 'lng': params.lng}} label={'You'} />
                    {marks.map((item) => {
                        return (
                            <Marker key={item.name} position={item.location} label={item.name} />
                        );
                    })}
                </GoogleMap>
            </LoadScript></>)
            : 
            (<><GoogleMap mapContainerStyle={map_styles} zoom={12} center={default_center}>
                <Marker key={'your current location'} position={{'lat': params.lat, 'lng': params.lng}} label={'You'} />
                {marks.map((item) => {
                    return (
                        <Marker key={item.name} position={item.location} label={item.name} />
                    );
                })}
            </GoogleMap></>)
        }
        </div>

        {studios.results.map((studio, key) => {
            return (
                <>
                <div className='studio'>
                    <Link to={'/studio/' + studio.id}>{studio.name}</Link> <br />
                    <hr/>
                    <p>Tel: {studio.phone_number}</p>
                    <hr/>
                    <p>address: {studio.address}</p>
                    <hr/>
                    <p>postal code: {studio.postal_code}</p>
                    <hr/>
                    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={50} slidesPerView={1}>
                        {studio.images.map((image, key) => (
                            <>
                            <SwiperSlide key={key}>
                                <img className='slide' src={props.base_url + image.image.substr(1)} alt='class_image'></img>
                            </SwiperSlide>
                            </>
                        ))}
                    </Swiper>

                    {props.is_admin ? 
                    <>
                    <button type='button' onClick={() => {navigate('/studio_edit/', {state: {add: false, studio: studio}})}}>modify</button> <br />
                    </> 
                    : <></>}
                </div>
                </>
            )
        })}

        <div className='button'>
            <button type='button' onClick={() => setParams({...params, page: Math.max(1, params.page-1)})}>prev</button> &emsp;
            page{params.page} &emsp;
            <button type='button' onClick={() => {if (next){ setParams({...params, page: params.page+1 });}}}>next</button>
        </div>
        </>
    )
}

export default Studio;