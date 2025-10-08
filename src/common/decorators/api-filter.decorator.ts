import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

/**
 * Custom query parameter decorator that handles nested objects with JSON values
 * Supports query params like: filters[name]={"contains":"il"}
 *
 * This decorator:
 * 1. Extracts the nested object from query (e.g., filters[name])
 * 2. Parses JSON string values into objects
 * 3. Integrates with Swagger using deepObject style
 *
 * @param name - The name of the parameter for Swagger documentation (default: 'filters')
 */
export const FilterQuery = (name: string = 'filters'): ParameterDecorator => {
  return createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();

      if (request.query[name] && typeof request.query[name] === 'object') {
        const nestedObj = request.query[name];
        const result = {};

        // Parse each field in the nested object
        for (const [field, value] of Object.entries(nestedObj)) {
          try {
            result[field] =
              typeof value === 'string' ? JSON.parse(value) : value;
          } catch (e) {
            result[field] = value;
          }
        }

        return result;
      }
      return {};
    },
    [
      (
        target: object,
        propertyKey: string | symbol,
        parameterIndex: number,
      ) => {
        const queryParamsType = Reflect.getMetadata(
          'design:paramtypes',
          target,
          propertyKey,
        );
        const paramType = queryParamsType[parameterIndex];

        Reflect.defineMetadata(
          DECORATORS.API_PARAMETERS,
          [
            {
              in: 'query',
              name,
              type: paramType,
              style: 'deepObject',
              explode: true,
              required: false,
              description: `Filter parameters using format: ${name}[field]={"operator":"value"}`,
            },
          ],
          target[propertyKey],
        );
        return target[propertyKey];
      },
    ],
  )(name);
};
