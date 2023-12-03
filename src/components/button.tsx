const Button = (props: {text: string, onClick: () => void}) => {
  return (
    <div>
      <button onClick={props.onClick}>{props.text}</button>
    </div>
  )
}

export default Button;