import PropTypes from 'prop-types'
import { Input as InputHeroUi } from '@heroui/react'

const Input = ({ value, handleChange, errors }) => {
  return (
    <InputHeroUi
      isRequired
      aria-label='Email'
      autoComplete='email'
      errorMessage={errors}
      isInvalid={!!errors}
      label='Correo electrónico'
      name='email'
      placeholder='usuario@correo.com'
      type='email'
      value={value}
      variant='underlined'
      onChange={handleChange}
    />
  )
}

Input.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  errors: PropTypes.string
}

export default Input
