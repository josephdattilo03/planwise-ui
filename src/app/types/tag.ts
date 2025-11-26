export interface Tag {
  id: number;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface TagOption extends Tag {
  inputValue?: string; // used for creatable “Add "<name>"” option
}
