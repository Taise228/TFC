import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style.css';

const Home = (props) => {
    // home画面
    // スタジオ一覧。クラス一覧、検索
    // 各スタジオページからクラスのページにも飛べるように
    const location = useLocation();
    const [msg, setMsg] = useState('');
    useEffect(() => {
        if (location.state){
            if (location.state.msg){
                console.log(location.state.msg)
                setMsg(location.state.msg);
            }else {
                setMsg('');
            }
        }else{
            setMsg('');
        }
    })

    return (
        <>
        <p className='message'>{msg}</p>

        <div className='container'>
            <div id='title'>
                <h1>Welcome to TFC</h1>
            </div>
            <hr />

            <img id='exterior' src='https://kpe.utoronto.ca/sites/default/files/styles/large/public/image/building/ACweb_0.png?h=39af960e&itok=UW-rmUu1' alt='studio_exterior' /> <br />

            <div className='list'>
                <div className='link'>
                    <img id='running' src='https://www.photolibrary.jp/mhd2/img778/450-20200619145431217573.jpg' alt='running machine' /> <br />
                    <Link to='/studio/'>See our studios</Link> <br />
                </div>
                <div className='link'>
                    <img id="gym" src='https://www.illust-box.jp/db_img/sozai/00012/127874/watermark.jpg' alt='gym' /> <br />
                    <Link to='/class/'>See our classes</Link> <br />
                </div>
            </div>

            <p>To check our subscription plan, please sign up first!</p>
        </div>
        </>
    );
}

export default Home;