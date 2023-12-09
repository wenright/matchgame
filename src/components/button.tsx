import Spinner from "~/components/spinner";

const Button = (props: {text: string, onClick: () => void, loading?: boolean}) => {
  return (
    <div className='flex relative flex-row content-center items-center'>
      <button onClick={props.onClick} disabled={props.loading} className="border-2 border-stone-100 rounded-lg p-2 w-40 bg-stone-800 hover:bg-stone-500 m-4">{props.text}</button>
      <Spinner active={props.loading ?? false} />
    </div>
  )
}

export default Button;