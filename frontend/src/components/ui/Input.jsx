import PropTypes from 'prop-types'
import { Input as InputHeroUi } from '@heroui/react'

const Input = ({ value, label, name, placeholder, type, handleChange, errors }) => {
  return (
    <InputHeroUi
      variant="underlined"
      isRequired
      label="Correo electrónico"
      name="email"
      placeholder="usuario@correo.com"
      type="email"
      autoComplete="email"
      aria-label="Email"
      value={value}
      onChange={handleChange}
      isInvalid={!!errors}
      errorMessage={errors}
    />
  )
}

Input.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  errors: PropTypes.string
}

export default Input
