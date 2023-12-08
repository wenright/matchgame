
const FullSpinner = (props: {active: boolean}) => {
  return (
    <div className={props.active ? "fixed flex justify-center items-center h-full w-full backdrop-blur-sm transition-all" : "hidden"}>
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-stone-100"></div>
    </div>
  );
};

export default FullSpinner;