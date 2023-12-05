const Button = (props: {text: string, onClick: () => void}) => {
  return (
    <div className='flex flex-col content-center items-center'>
      <button onClick={props.onClick} className="border-2 border-stone-100 rounded-lg p-2 w-40 bg-stone-800 hover:bg-stone-500 m-4">{props.text}</button>
    </div>
  )
}

export default Button;