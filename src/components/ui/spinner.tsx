
const Spinner = (props: { active: boolean }) => {
  return (
    <div className={props.active ? "flex absolute justify-center items-center inset-y-0 right-[-24px]" : "hidden"}>
      <div className="animate-spin absolute rounded-full h-8 w-8 border-2 border-stone-100 border-transparent border-b-stone-100 rounded-t-[50%]"></div>
    </div>
  );
};

export default Spinner;