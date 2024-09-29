import {setNewOffset, setZIndex, gridsnap} from '../utils.js'
import {useRef, useState} from "react";

import { Sliders, Trash2 } from 'react-feather';
import { useParams } from 'react-router-dom';
import updateWidget from '../room/UpdateWidget.jsx';
import deleteNote from '../room/DeleteWidget.jsx';
import ChangeColor from '../room/ChangeColor.jsx'

const Card = ({ widget, BodyComponent, onDelete, min_width }) => {
    const [width, setWidth] = useState(widget.width)
    const [position,setPosition] = useState(widget.position)

    const {roomId} = useParams();
    const colors = widget.colors

    let dragStartPosX = 0;
    let mouseStartPos = { x: 0, y: 0 };

    const cardRef = useRef(null);
    const isResizing = useRef(false);


    const handleDelete = async () => {
        onDelete(widget.id); // Call the onDelete callback to update Room state
        await deleteNote(roomId, widget.id);
    };

    const handleColor = async() =>{
        ChangeColor(roomId,widget.id);
        return;
    }


    const mouseDown = (e) =>{
        setZIndex(cardRef.current);
        
        mouseStartPos.x = e.clientX
        mouseStartPos.y = e.clientY

        document.addEventListener("mousemove", mouseMove)
        document.addEventListener("mouseup", mouseUp)
    }

    const mouseMove = (e)=>{
        let mouseMoveDir = {
            x: mouseStartPos.x - e.clientX,
            y: mouseStartPos.y - e.clientY
        };

        mouseStartPos.x = gridsnap(e.clientX,20)
        mouseStartPos.y = gridsnap(e.clientY,20)


        let newPosition = setNewOffset(cardRef.current, mouseMoveDir);

        newPosition.x = gridsnap(newPosition.x,20)
        newPosition.y = gridsnap(newPosition.y,20)
        setPosition(newPosition);
        
    };

    const mouseUp = () => {
        document.removeEventListener("mousemove",mouseMove);
        document.removeEventListener("mousedown", mouseDown);

        const newPosition = setNewOffset(cardRef.current); //{x,y}
        saveData("position", newPosition);  
    }
    
    //<----- for resizing window ---->

    const resizeMouseDown = (e) =>{
        e.preventDefault();
        isResizing.current = true;
        dragStartPosX = e.clientX
    };

    const resizeMouseMove = (e) => {
        if (!isResizing.current) return;

        const cardLeft = cardRef.current.getBoundingClientRect().left;
        let newWidth = e.clientX - cardLeft +25; // should be same size as gridsnap

        newWidth = gridsnap(newWidth,20)

        newWidth = Math.min(Math.max(newWidth,min_width),600) - 5
        setWidth(Math.min(Math.max(newWidth,min_width),600) - 5)

        if (Math.abs(newWidth-width) > 10){
            saveData("width", newWidth);
        }
    };

    const resizeMouseUp = () => {
        isResizing.current = false;
    };

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await updateWidget(roomId, widget.id, payload);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div ref = {cardRef}
        onMouseMove ={resizeMouseMove}
        onMouseUp={resizeMouseUp}
        onMouseLeave={resizeMouseUp}
        className="card" 
        style={{
            backgroundColor: colors.colorBody, 
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${width}px`}}
        >
            <div
                onMouseDown = {mouseDown}
                className = "card-header" 
                style = {{backgroundColor:colors.colorHeader}}
            >
                <div className='flex flex-row'>
                    <Sliders size={16} color='black' className='m-1' onClick = {handleColor}/>
                    <Trash2 size={16} color='black' className='m-1' onClick={handleDelete} />
                </div>
            </div>
            
            <BodyComponent />


            <div className = "resize-handle top-8" onMouseDown={resizeMouseDown}/>
        </div>
    );
};

export default Card;