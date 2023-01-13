import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const StudioInfo = (props) => {
    const location = useLocation();
    const m = location.pathname.match(/\d+$/)
    const id = m?m[0]:null;

    const [studio, setStudio] = useState({});
    const [location_error, setLocationError] = useState('connot use current location');
    const [loc, setLoc] = useState({lat: 0, lng: 0});
    const [error, setError] = useState('');
    const [default_center, setDefaultCenter] = useState({lat: 43.66, lng: -79.39,});
    const [classes, setClasses] = useState({});

    const map_styles = {
        height: '20rem',
        width: '20rem',
        margin: '1rem',
    }

    useEffect(() => {
        const req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
                'Content-Type': 'application/json',
            },
        }
        fetch(props.base_url + 'accounts/profile/', req)
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
        navigator.geolocation.getCurrentPosition((position) => {
            setLocationError('');
            setLoc({lat: position.coords.latitude, lng: position.coords.longitude}); 
        });
        const requestOptions = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        };
        fetch(props.base_url + 'studios/studio/' + id + '/', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                setStudio({...data});
                setDefaultCenter({lat: data.latitude, lng: data.longitude});
            })
            .catch((err) => setError(err.toString()))
    }, [])

    return (
        <>
        <p className='notification'>{error}</p>
        <p className='notification'>{location_error}</p>

        <p>Studio: {studio.name}</p>
        <p>address: {studio.address}</p>
        <p>postal_code: {studio.postal_code}</p>
        <p>Tel: {studio.phone_number}</p>

        {window.google === undefined ? 
            (<><LoadScript googleMapsApiKey={props.api_key}>
                <GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}>
                    <Marker position={{lat: studio.latitude, lng: studio.longitude}} label={studio.name} />
                </GoogleMap>
            </LoadScript></>)
            : 
            (<><GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}>
                <Marker position={{lat: studio.latitude, lng: studio.longitude}} label={studio.name} />
            </GoogleMap></>)
        }

        <Link to={'/studio/'}>Studios</Link>
        </>
    )
}

export default StudioInfo;