import './style.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Geocode from 'react-geocode';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import axios from 'axios';

const StudioEdit = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [error, setError] = useState('');

    const [add, setAdd] = useState(false);
    const [add_image, setAddImage] = useState(false);
    const [studio, setStudio] = useState({});
    const [new_studio, setNewStudio] = useState({});
    const [new_image, setNewImage] = useState(new Blob());
    const [delete_studio, setDeleteStudio] = useState(false);

    const [default_center, setDefaultCenter] = useState({lat: 43.66, lng: -79.39,});

    useEffect(() => {
        /*if (!props.is_admin){
            if (!props.is_authenticated){
                navigate('/login/', {state: {error: 'please log in'}});
            }else {
                navigate('/user/', {state: {msg: 'this operation is allowed for only admin users'}});
            }
        }*/
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
                console.log(data);
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
        if (location.state){
            if (location.state.add){
                setAdd(location.state.add);
            }
            if (location.state.studio){
                setStudio(() => (location.state.studio));
                setNewStudio(() => (location.state.studio));
            }else {
                if (!location.state.add){
                    navigate('/user/', {state: {msg: 'please specify the studio'}});
                }
            }
        }else {
            navigate('/user/', {state: {msg: 'please specify the studio!'}});
        }
    }, [])

    // handle chnge -----------------------------------------------------------------
    const handleNameChange = (e) => {setNewStudio({...new_studio, name: e.target.value})}
    const handleAddressChange = (e) => {
        setNewStudio((new_studio) => ({...new_studio, address: e.target.value}))
        Geocode.setApiKey(props.api_key)
        Geocode.fromAddress(e.target.value)
            .then((res) => {
                setNewStudio((new_studio) => ({...new_studio, lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng}))
                setDefaultCenter({lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng})
            })
            .catch((err) => {
                setNewStudio((new_studio) => ({...new_studio, lat: null, lng: null}))
            })
    }
    const handlePostalCodeChange = (e) => {
        setNewStudio((new_studio) => ({...new_studio, postal_code: e.target.value}));
        Geocode.setApiKey(props.api_key)
        Geocode.fromAddress(e.target.value)
            .then((res) => {
                setNewStudio((new_studio) => ({...new_studio, lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng, address: res.results[0].formatted_address}))
                setDefaultCenter({lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng})
            })
    }
    const handlePhoneNumberChange = (e) => {setNewStudio({...new_studio, phone_number: e.target.value})}

    const handleChangeImage = (e) => {
        const files = e.target.files;
        //console.log(files[0])
        setNewImage(...files);
    };

    const handleSubmit = (e) => {
        if (!new_studio.name || !new_studio.lat || !new_studio.lng || !new_studio.address || !new_studio.postal_code || !new_studio.phone_number){
            setError('please provide valid information');
        }else {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...new_studio, longitude: new_studio.lng, latitude: new_studio.lat})
            }
            fetch(props.base_url + 'studios/studio/', requestOptions)
                .then((res) => res.json())
                .then((data) => {
                    if (data.detail){
                        navigate('/user/', {state: {msg: 'failed'}});
                    }else {
                        navigate('/user/', {state: {msg: 'studio added'}});
                    }
                })
                .catch((err) => {
                    setError(err.toString());
                })
        }
    }

    const handlePatch = (e) => {
        if (!new_studio.lat || !new_studio.lng || !new_studio.address || !new_studio.postal_code || !new_studio.phone_number){
            setError('please provide valid information');
        }else {
            const requestOptions = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({address: new_studio.address, postal_code: new_studio.postal_code, phone_number: new_studio.phone_number, longitude: new_studio.lng, latitude: new_studio.lat})
            }
            fetch(props.base_url + 'studios/studio/' + studio.id + '/', requestOptions)
                .then((res) => res.json())
                .then((data) => {
                    if (data.detail){
                        navigate('/user/', {state: {msg: 'failed'}});
                    }else {
                        navigate('/user/', {state: {msg: 'studio modified'}});
                    }
                })
                .catch((err) => {
                    setError(err.toString());
                })
        }

    }

    const handleAddImage = (e) => {
        const submitData = new FormData();
        const config = {
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('access'),}
        }
        if (new_image !== undefined && new_image.size !== 0){
            submitData.append("image", new_image);
            submitData.append('studio', studio.name);
            axios.post(props.base_url + 'studios/studioimage/', submitData, config)
                .then((res) => {
                    if (!res.data){
                        navigate('/user/', {state: {msg: 'failed'}});
                    }else{
                        navigate('/user/', {state: {msg: 'image added'}});
                    }
                })
                .catch((err) => {
                    navigate('/user/', {state: {msg: 'failed'}});
                });
        }
    }
    const handleDelete = (e) => {
        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
            },
        }
        fetch(props.base_url + 'studios/studio/' + studio.id + '/', requestOptions)
            .then((res) => {
                if (res.ok){
                    navigate('/user/', {state: {msg: 'studio deleted'}});
                }else {
                    navigate('/user/', {state: {msg: 'failed'}});
                }
            })
            .catch((err) => {console.log(err);})
    }
    // Google Maps -----------------------------------------------
    const map_styles = {
        height: '20rem',
        width: '20rem',
        margin: '1rem',
    }

    if (add){
        return (
            <>
            <p className='notification'>{error}</p>
            <label htmlFor='name'>name</label>
            <input id='name' type={'text'} value={new_studio.name} onChange={handleNameChange} /> <br />
            <label htmlFor='address'>address</label>
            <input id='address' type={'text'} value={new_studio.address} onChange={handleAddressChange} /> <br />
            <label htmlFor='posta_code'>postal code</label>
            <input id='postal_code' type={'text'} value={new_studio.postal_code} onChange={handlePostalCodeChange} /> <br />
            <label htmlFor='phone_number'>phone_number</label>
            <input id='phone_number' type={'text'} value={new_studio.phone_number} onChange={handlePhoneNumberChange} /> <br />

            <p>latitude: {new_studio.lat}</p>
            <p>longitude: {new_studio.lng}</p>

            <button type='submit' onClick={handleSubmit}>submit</button>

            {window.google === undefined ? (
                <>
                <LoadScript googleMapsApiKey={props.api_key}>
                    <GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}></GoogleMap>
                </LoadScript></>)
                : 
                (<><GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}></GoogleMap></>)
            }
            </>
        )
    }

    if (delete_studio){
        return (
            <>
            <p className='notification'>Are you sure to delete this studio?</p>
            <div className='studio'>
                <Link to={'/studio/' + studio.id}>{studio.name}</Link> <br />
                <p>Tel: {studio.phone_number}</p>
                <p>address: {studio.address}</p>
                <p>postal code: {studio.postal_code}</p>
                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={50} slidesPerView={1}>
                    {studio.images.map((image, key) => (
                        <>
                        <SwiperSlide key={key}>
                            <img className='slide' src={props.base_url + image.image.substr(1)} alt='class_image'></img>
                        </SwiperSlide>
                        </>
                    ))}
                </Swiper>
            </div>
            <button type='button' onClick={handleDelete}>delete</button> <br />
            <button type='button' onClick={() => {setDeleteStudio(false)}}>back</button>
            </>
        )
    }

    return (
        <>
        {Object.keys(studio).length !== 0 ? <>
        <p className='notification'>{error}</p>
        <div className='studio'>
            <Link to={'/studio/' + studio.id}>{studio.name}</Link> <br />
            <p>Tel: {studio.phone_number}</p>
            <p>address: {studio.address}</p>
            <p>postal code: {studio.postal_code}</p>
            <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={50} slidesPerView={1}>
                {studio.images.map((image, key) => (
                    <>
                    <SwiperSlide key={key}>
                        <img className='slide' src={props.base_url + image.image.substr(1)} alt='class_image'></img>
                    </SwiperSlide>
                    </>
                ))}
            </Swiper>
        </div>
        <button type='button' onClick={() => {setDeleteStudio(true)}}>delete studio</button>
        <div>
            {add_image ? 
            <>
            <button type='button' onClick={() => {setAddImage(false)}}>modify information</button> <br />
            <label htmlFor='image'>new image: </label>
            <input id='image' name='image' type='file' alt='new image' onChange={handleChangeImage}></input> <br />
            <button type='submit' onClick={handleAddImage}>add</button>
            </>
            :
            <>
            <button type='button' onClick={() => {setAddImage(true)}}>add image</button>
            <p>name: {studio.name}</p> <br />
            <label htmlFor='address'>address</label>
            <input id='address' type={'text'} value={new_studio.address} onChange={handleAddressChange} /> <br />
            <label htmlFor='posta_code'>postal code</label>
            <input id='postal_code' type={'text'} value={new_studio.postal_code} onChange={handlePostalCodeChange} /> <br />
            <label htmlFor='phone_number'>phone_number</label>
            <input id='phone_number' type={'text'} value={new_studio.phone_number} onChange={handlePhoneNumberChange} /> <br />

            <p>latitude: {new_studio.lat}</p>
            <p>longitude: {new_studio.lng}</p>

            <button type='submit' onClick={handlePatch}>submit</button>

            {window.google === undefined ? (
                <>
                <LoadScript googleMapsApiKey={props.api_key}>
                    <GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}></GoogleMap>
                </LoadScript></>)
                : 
                (<><GoogleMap mapContainerStyle={map_styles} zoom={14} center={default_center}></GoogleMap></>)
            }
            </>}
        </div> </>: <></>}
        </>
    )
}

export default StudioEdit;