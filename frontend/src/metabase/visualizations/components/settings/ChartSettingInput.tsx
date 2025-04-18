import { useEffect, useState } from "react";

import { TextInput } from "metabase/ui";

interface ChartSettingInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  id?: string;
}

export const ChartSettingInput = ({
  value,
  onChange,
  placeholder,
  id,
}: ChartSettingInputProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <TextInput
      id={id}
      data-testid={id}
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={() => {
        if (inputValue !== (value || "")) {
          onChange(inputValue);
        }
      }}
    />
  );
};
