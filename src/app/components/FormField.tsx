import React, { useState, InputHTMLAttributes, SelectHTMLAttributes } from "react";

// ─── Colors (single source of truth) ─────────────────────────────────────────
const C = {
  bg: "#0E0E1A",
  bgFocus: "#13131F",
  border: "rgba(201,168,76,0.18)",
  borderFocus: "rgba(201,168,76,0.6)",
  borderError: "rgba(226, 100, 100, 0.6)",
  text: "#F0E6D3",
  placeholder: "rgba(240,230,211,0.3)",
  label: "rgba(240,230,211,0.55)",
  labelFocus: "#C9A84C",
};

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  inputClassName?: string;
}

export function FormField({ label, error, inputClassName = "", id, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div id={`FormField-${fieldId}`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        htmlFor={fieldId}
        style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          fontWeight: 600,
          color: focused ? C.labelFocus : C.label,
          transition: "color 0.2s ease",
        }}
      >
        {label.toUpperCase()}
      </label>

      <input
        id={fieldId}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          fontFamily: "'Raleway', sans-serif",
          background: focused ? C.bgFocus : C.bg,
          border: `1px solid ${error ? C.borderError : focused ? C.borderFocus : C.border}`,
          borderRadius: "8px",
          padding: "12px 16px",
          color: C.text,
          fontSize: "0.92rem",
          outline: "none",
          transition: "all 0.2s ease",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: focused ? `0 0 0 3px rgba(201,168,76,0.08)` : "none",
        }}
        placeholder={rest.placeholder}
        {...rest}
        className={inputClassName}
      />

      {error && (
        <span style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: "0.75rem",
          color: "rgba(226,100,100,0.9)",
          letterSpacing: "0.02em",
        }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  error?: string;
  placeholder?: string;
}

export function SelectField({ label, options, error, placeholder, id, ...rest }: SelectFieldProps) {
  const [focused, setFocused] = useState(false);
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div id={`SelectField-${fieldId}`} style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
      <label
        htmlFor={fieldId}
        style={{
          fontFamily: "'Raleway', sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          fontWeight: 600,
          color: focused ? C.labelFocus : C.label,
          transition: "color 0.2s ease",
        }}
      >
        {label.toUpperCase()}
      </label>

      <select
        id={fieldId}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: "'Raleway', sans-serif",
          background: focused ? C.bgFocus : C.bg,
          border: `1px solid ${error ? C.borderError : focused ? C.borderFocus : C.border}`,
          borderRadius: "8px",
          padding: "12px 16px",
          color: rest.value ? C.text : C.placeholder,
          fontSize: "0.92rem",
          outline: "none",
          transition: "all 0.2s ease",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
          boxShadow: focused ? `0 0 0 3px rgba(201,168,76,0.08)` : "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23C9A84C' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "36px",
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#0E0E1A", color: C.text }}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.75rem", color: "rgba(226,100,100,0.9)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
