export default function InputField({label, type="text", name, onChange = () => {}, placeholder, value}){
    return(
        <div className="input-field flex flex-col gap-1 col-span-12 mt-2 md:col-span-6 lg:col-span-4 w-full">
            <label className="text-sm text-slate-500">{label}</label>
            <div className="h-fit before:content-[' '] before:block before:w-1 before:h-inherit before:bg-main flex">
            <input className="bg-slate-200 p-2 relative outline-0 focus:outline-none placeholder-slate-300 w-full text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm"
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
            />
            </div>
        </div>
    )
}