const input = (props: {value: string, stateFn: (newValue: string) => void}) => {
  return (
    <div className='my-4'>
      <input value={props.value} onChange={(e) => props.stateFn(e.target.value)} type='text' className='border-2 border-transparent border-b-stone-100 bg-transparent p-2'></input>
    </div>
  )
}

export default input