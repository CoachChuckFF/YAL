import './../App.css';

export function Header(props:any) {
    return (
        <div className="puzzle-code-header">
            {props.text ?? 'Generated:'}
        </div>
    );
}

export function ConstCode(props:any){
    return (
        <div className="puzzle-code">
            {props.code}
        </div>
    );
}