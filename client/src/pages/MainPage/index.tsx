import {useNavigate} from "react-router-dom";


const MainPage = () => {

  const navigate = useNavigate();

  const handleClick = () => {
    const input = document.getElementById('room');
    if (input && input.value && input.value.length > 0) {
      return navigate(input.value);
    }
  }

  return (
    <div>
      <label htmlFor="room">Комната</label>
      <input type="text" id={'room'} placeholder={"Введите номер комнаты"}/>
      <button onClick={handleClick}>Перейти</button>
    </div>
  )
}

export default MainPage;
