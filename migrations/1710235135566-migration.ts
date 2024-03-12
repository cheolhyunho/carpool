import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class migration1710235135566 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'USER',
      new TableColumn({
        name: 'socketId',
        type: 'varchar',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
