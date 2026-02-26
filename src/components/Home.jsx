import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
const Home = () => {


    return(
    <>
        <Navbar />
        <div className="bg-blue-500 m-60 justify-center items-center flex flex-col rounded-xl px-3 py-6">
            <h1>Welcome Home</h1>
            <p>Your Journey begins here</p>

        </div>
       
        </>
    )
}
export default Home