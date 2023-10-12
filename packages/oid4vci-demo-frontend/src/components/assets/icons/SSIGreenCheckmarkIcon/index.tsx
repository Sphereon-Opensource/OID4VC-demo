import React, {CSSProperties, FC, ReactElement} from 'react'

export interface IProps {
    size?: number
    style?: CSSProperties
}

const SSIGreenCheckmarkIcon: FC<IProps> = (props: IProps): ReactElement => {
    const {size = 16, style} = props

    return (
            <div style={{...style, width: size, aspectRatio: 1, display: 'flex'}}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7.5" cy="7.5" r="7.5" fill="#00C249"/>
                    <path d="M5.99554 11H5.99232C5.93141 10.9996 5.87119 10.988 5.81517 10.9658C5.75914 10.9436 5.70843 10.9113 5.66597 10.8707L3.13795 8.45536C3.09417 8.41554 3.05941 8.368 3.03572 8.31553C3.01203 8.26306 2.99989 8.20673 3 8.14984C3.00012 8.09295 3.01249 8.03666 3.03639 7.98427C3.06029 7.93189 3.09524 7.88447 3.13918 7.8448C3.18312 7.80514 3.23516 7.77403 3.29224 7.75332C3.34933 7.7326 3.4103 7.72268 3.47157 7.72416C3.53284 7.72564 3.59318 7.73847 3.64902 7.76191C3.70487 7.78535 3.7551 7.81892 3.79677 7.86065L5.99998 9.9653L11.221 5.11976C11.3077 5.04204 11.4238 4.99904 11.5444 5.00002C11.6649 5.00099 11.7802 5.04586 11.8654 5.12495C11.9506 5.20405 11.9989 5.31105 12 5.42291C12.001 5.53477 11.9547 5.64254 11.871 5.723L6.3205 10.875C6.23432 10.955 6.11743 11 5.99554 11Z" fill="#FBFBFB"/>
                </svg>
            </div>
    )
}

export default SSIGreenCheckmarkIcon
