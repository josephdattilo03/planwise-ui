export interface Tag {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface TagOption extends Tag {
  inputValue?: string; // used for creatable “Add "<name>"” option
}
