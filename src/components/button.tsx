import Spinner from "~/components/spinner";

const Button = (props: {text: string, onClick: () => void, spinnerActive?: boolean}) => {
  return (
    <div className='flex relative flex-row content-center items-center'>
      <button onClick={props.onClick} className="border-2 border-stone-100 rounded-lg p-2 w-40 bg-stone-800 hover:bg-stone-500 m-4">{props.text}</button>
      <Spinner active={props.spinnerActive ?? false} />
    </div>
  )
}

export default Button;