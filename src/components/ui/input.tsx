const input = (props: {value: string, placeholder?: string, stateFn: (newValue: string) => void, onSubmit?: () => void, className?: string}) => {
  return (
      <div className={(props.className ?? '')}>
        <input value={props.value}
          onChange={(e) => props.stateFn(e.target.value)}
          placeholder={props.placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && props.onSubmit) {
              props.onSubmit();
            }
          }}
          type='text'
          className='border-2 border-transparent border-b-stone-500 bg-transparent w-full !outline-none focus:border-b-stone-100 transition'></input>
    </div>
  )
}

export default input