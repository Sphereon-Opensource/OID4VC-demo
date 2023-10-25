import {DataFormRow} from "../ecosystem/ecosystem-config"

export const DEFAULT_FORM: DataFormRow[] = [
    [
        {
            id: "firstName",
            key: "firstName",
            label: "ssi_information_request_page_form_first_name_label",
            type: "text",
            required: true
        }
    ],
    [
        {
            id: "lastName",
            key: "lastName",
            label: "ssi_information_request_page_form_last_name_label",
            type: "text",
            required: true
        }
    ],
    [
        {
            id: "emailAddress",
            key: "emailAddress",
            label: "ssi_information_request_page_form_email_label",
            type: "text",
            required: true,
            customValidation: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        }
    ]
]